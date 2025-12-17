import 'dotenv/config'
import {createClient} from '@sanity/client'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

if (!projectId || !dataset) {
  throw new Error('Sanity credentials are missing. Please set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET.')
}

if (!token) {
  throw new Error('SANITY_API_TOKEN is required to delete gallery documents.')
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const DELETE_CHUNK_SIZE = Number(process.env.SANITY_DELETE_CHUNK_SIZE ?? 200)
const PATCH_CHUNK_SIZE = Number(process.env.SANITY_PATCH_CHUNK_SIZE ?? 50)
const RAW_PERSPECTIVE = {perspective: 'raw'} as const

type PatchJob = {
  id: string
  unsetPaths?: string[]
}

function chunkArray<T>(values: T[], chunkSize: number): T[][] {
  if (!values.length) return []
  const chunks: T[][] = []
  for (let index = 0; index < values.length; index += chunkSize) {
    chunks.push(values.slice(index, index + chunkSize))
  }
  return chunks
}

async function applyPatchJobs(jobs: PatchJob[], label: string) {
  if (!jobs.length) {
    console.log(`ℹ️  No ${label} found.`)
    return
  }

  const chunks = chunkArray(jobs, PATCH_CHUNK_SIZE)
  console.log(`🛠️  Clearing ${label} in ${chunks.length} batch${chunks.length === 1 ? '' : 'es'}...`)

  for (let index = 0; index < chunks.length; index += 1) {
    const tx = client.transaction()
    chunks[index].forEach((job) => {
      tx.patch(job.id, (patch) => {
        if (job.unsetPaths?.length) {
          patch = patch.unset(job.unsetPaths)
        }
        return patch
      })
    })
    await tx.commit({visibility: 'async'})
    console.log(`   • Cleared batch ${index + 1}/${chunks.length}`)
  }
}

const escapeKey = (key: string) => key.replace(/"/g, '\"')

async function unlinkGalleryReferences() {
  const reviews = await client.fetch<string[]>(
    '*[_type == "review" && defined(gallery)]._id',
    {},
    RAW_PERSPECTIVE,
  )
  await applyPatchJobs(
    reviews.map((id) => ({id, unsetPaths: ['gallery']})),
    'review gallery references',
  )

  const exhibitions = await client.fetch<string[]>(
    '*[_type == "exhibition" && defined(gallery)]._id',
    {},
    RAW_PERSPECTIVE,
  )
  await applyPatchJobs(
    exhibitions.map((id) => ({id, unsetPaths: ['gallery']})),
    'exhibition gallery references',
  )

  const artEvents = await client.fetch<string[]>(
    '*[_type == "artEvent" && defined(gallery)]._id',
    {},
    RAW_PERSPECTIVE,
  )
  await applyPatchJobs(
    artEvents.map((id) => ({id, unsetPaths: ['gallery']})),
    'art event gallery references',
  )

  const guides = await client.fetch<Array<{_id: string; keys: string[]}>>(
    '*[_type == "guide" && count(stops[defined(gallery)]) > 0]{_id, "keys": stops[defined(gallery)]._key}',
    {},
    RAW_PERSPECTIVE,
  )
  await applyPatchJobs(
    guides
      .map((doc) => ({
        id: doc._id,
        unsetPaths: doc.keys.map((key) => `stops[_key == "${escapeKey(key)}"].gallery`),
      }))
      .filter((job) => job.unsetPaths && job.unsetPaths.length > 0),
    'guide stop gallery references',
  )

  const mapDocs = await client.fetch<string[]>(
    '*[_type == "mapData" && count(galleries) > 0]._id',
    {},
    RAW_PERSPECTIVE,
  )
  await applyPatchJobs(
    mapDocs.map((id) => ({id, unsetPaths: ['galleries']})),
    'map data gallery arrays',
  )

  const authors = await client.fetch<Array<{_id: string; keys: string[]}>>(
    '*[_type == "author" && count(recommendations[@->._type == "gallery"]) > 0]{_id, "keys": recommendations[@->._type == "gallery"]._key}',
    {},
    RAW_PERSPECTIVE,
  )
  await applyPatchJobs(
    authors
      .map((doc) => ({
        id: doc._id,
        unsetPaths: doc.keys.map((key) => `recommendations[_key == "${escapeKey(key)}"]`),
      }))
      .filter((job) => job.unsetPaths && job.unsetPaths.length > 0),
    'author gallery recommendations',
  )
}

async function clearGalleries() {
  console.log('🧹 Clear galleries script running...')
  console.log('♻️  Removing references before deletion...')
  await unlinkGalleryReferences()

  console.log('🔍 Counting gallery documents...')
  const total = await client.fetch<number>('count(*[_type == "gallery"])', {}, RAW_PERSPECTIVE)

  if (!total) {
    console.log('✅ No galleries found. Dataset is already clean.')
    return
  }

  console.log(`🧾 Fetching ${total} gallery id${total === 1 ? '' : 's'}...`)
  const ids = await client.fetch<string[]>('*[_type == "gallery"]._id', {}, RAW_PERSPECTIVE)

  if (!ids.length) {
    console.log('⚠️  No IDs returned even though count was non-zero. Aborting to stay safe.')
    return
  }

  const chunked = chunkArray(ids, DELETE_CHUNK_SIZE)
  console.log(
    `🗑️  Removing galleries in ${chunked.length} chunk${chunked.length === 1 ? '' : 's'} of up to ${DELETE_CHUNK_SIZE} docs...`,
  )

  for (let index = 0; index < chunked.length; index += 1) {
    const chunk = chunked[index]
    const tx = client.transaction()
    chunk.forEach((id) => tx.delete(id))
    await tx.commit({visibility: 'async'})
    console.log(
      `   • Deleted chunk ${index + 1}/${chunked.length} (${chunk.length} docs) → ${Math.max(
        ids.length - (index + 1) * DELETE_CHUNK_SIZE,
        0,
      )} remaining`,
    )
  }

  console.log('✨ Galleries removed. Sanity will finalize the deletion asynchronously.')
}

clearGalleries().catch((error) => {
  console.error('❌ Failed to delete galleries:', error)
  process.exit(1)
})
