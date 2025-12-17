import 'dotenv/config'
import {createClient} from '@sanity/client'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

if (!projectId || !dataset) {
  throw new Error('Sanity credentials are missing. Please set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET.')
}

if (!token) {
  throw new Error('SANITY_API_TOKEN is required to delete artist documents.')
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

async function unlinkArtistReferences() {
  // artEvent.artist or artEvent.artists (single or array reference)
  const artEventsSingle = await client.fetch<string[]>(
    '*[_type == "artEvent" && defined(artist)]._id',
    {},
    RAW_PERSPECTIVE,
  )
  await applyPatchJobs(
    artEventsSingle.map((id) => ({id, unsetPaths: ['artist']})),
    'artEvent artist references',
  )

  const artEventsArray = await client.fetch<string[]>(
    '*[_type == "artEvent" && count(artists) > 0]._id',
    {},
    RAW_PERSPECTIVE,
  )
  await applyPatchJobs(
    artEventsArray.map((id) => ({id, unsetPaths: ['artists']})),
    'artEvent artists arrays',
  )

  // exhibition.artists (array of references)
  const exhibitions = await client.fetch<string[]>(
    '*[_type == "exhibition" && count(artists) > 0]._id',
    {},
    RAW_PERSPECTIVE,
  )
  await applyPatchJobs(
    exhibitions.map((id) => ({id, unsetPaths: ['artists']})),
    'exhibition artists arrays',
  )

  // review.artists (array of references)
  const reviews = await client.fetch<string[]>(
    '*[_type == "review" && count(artists) > 0]._id',
    {},
    RAW_PERSPECTIVE,
  )
  await applyPatchJobs(
    reviews.map((id) => ({id, unsetPaths: ['artists']})),
    'review artists arrays',
  )

  // gallery.artists (array of references)
  const galleries = await client.fetch<string[]>(
    '*[_type == "gallery" && count(artists) > 0]._id',
    {},
    RAW_PERSPECTIVE,
  )
  await applyPatchJobs(
    galleries.map((id) => ({id, unsetPaths: ['artists']})),
    'gallery artists arrays',
  )

  // artistStory.artist (single reference)
  const artistStories = await client.fetch<string[]>(
    '*[_type == "artistStory" && defined(artist)]._id',
    {},
    RAW_PERSPECTIVE,
  )
  await applyPatchJobs(
    artistStories.map((id) => ({id, unsetPaths: ['artist']})),
    'artistStory artist references',
  )
}

async function clearArtists() {
  console.log('🧹 Clear artists script running...')
  console.log('♻️  Removing references before deletion...')
  await unlinkArtistReferences()

  console.log('🔍 Counting artist documents...')
  const total = await client.fetch<number>('count(*[_type == "artist"])', {}, RAW_PERSPECTIVE)

  if (!total) {
    console.log('✅ No artists found. Dataset is already clean.')
    return
  }

  console.log(`🧾 Fetching ${total} artist id${total === 1 ? '' : 's'}...`)
  const ids = await client.fetch<string[]>('*[_type == "artist"]._id', {}, RAW_PERSPECTIVE)

  if (!ids.length) {
    console.log('⚠️  No IDs returned even though count was non-zero. Aborting to stay safe.')
    return
  }

  const chunked = chunkArray(ids, DELETE_CHUNK_SIZE)
  console.log(
    `🗑️  Removing artists in ${chunked.length} chunk${chunked.length === 1 ? '' : 's'} of up to ${DELETE_CHUNK_SIZE} docs...`,
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

  console.log('✨ Artists removed. Sanity will finalize the deletion asynchronously.')
}

clearArtists().catch((error) => {
  console.error('❌ Failed to delete artists:', error)
  process.exit(1)
})
