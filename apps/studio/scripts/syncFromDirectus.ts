import 'dotenv/config'
import {createClient} from '@sanity/client'

type DirectusGallery = {
  id: number | string
  galleryname?: string | null
  fulladdress?: string | null
  city?: string | null
  country?: string | null
  lat?: number | null
  lon?: number | null
  placeurl?: string | null
  openinghours?: string | null
  newsletter_email?: string | null
  updated?: string | null
}

type DirectusArtist = {
  id: number | string
  name?: string | null
  description?: string | null
  birth_year?: number | null
  country?: string | null
  date_updated?: string | null
}

type DirectusExhibition = {
  id: number | string
  title?: string | null
  description?: string | null
  gallery_id?: number | string | null
}

type PreparedDoc = {
  id: string
  createDoc: {
    _id: string
    _type: string
    [key: string]: any
  }
  patchSet: Record<string, any>
  setIfMissing: Record<string, any>
}

const sanityClient = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '',
  dataset: process.env.SANITY_STUDIO_DATASET || 'blog',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const DIRECTUS_URL =
  process.env.SANITY_STUDIO_DIRECTUS_URL || process.env.DIRECTUS_URL || process.env.VITE_DIRECTUS_URL || ''
const DIRECTUS_TOKEN =
  process.env.SANITY_STUDIO_DIRECTUS_TOKEN || process.env.DIRECTUS_TOKEN || process.env.VITE_DIRECTUS_TOKEN || ''
const DIRECTUS_BATCH_SIZE = Number(process.env.DIRECTUS_BATCH_SIZE || 500)
const SANITY_CHUNK_SIZE = Number(process.env.SANITY_MUTATION_CHUNK || 50)
const SYNCED_AT = new Date().toISOString()

if (!sanityClient.config().projectId || !sanityClient.config().dataset) {
  throw new Error('Sanity credentials are missing. Please set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET.')
}

if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
  throw new Error('Directus credentials are missing. Set DIRECTUS_URL and DIRECTUS_TOKEN in your environment.')
}

const availableTargets = ['galleries', 'artists', 'exhibitions'] as const
type SyncTarget = (typeof availableTargets)[number]

const requestedTargets = process.argv[2]?.split(',').map((item) => item.trim().toLowerCase()) as
  | SyncTarget[]
  | undefined
const targetsToSync = requestedTargets?.length ? requestedTargets : availableTargets

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

function slugify(value: string, fallback: string) {
  return (
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 96) || fallback
  )
}

function cleanRecord<T extends Record<string, any>>(record: T) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined && value !== null && value !== '')
  ) as Partial<T>
}

async function fetchCollection<T>(collection: string, params: Record<string, any>) {
  const items: T[] = []
  let offset = 0

  while (true) {
    const url = new URL(`${DIRECTUS_URL}/items/${collection}`)
    url.searchParams.set('limit', String(DIRECTUS_BATCH_SIZE))
    url.searchParams.set('offset', String(offset))

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      url.searchParams.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
    })

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Directus request failed (${response.status}): ${errorText}`)
    }

    const json = await response.json()
    const batch: T[] = json.data || []
    items.push(...batch)

    if (batch.length < DIRECTUS_BATCH_SIZE) break
    offset += DIRECTUS_BATCH_SIZE
  }

  return items
}

async function commitPreparedDocs(prepared: PreparedDoc[], label: string) {
  if (!prepared.length) {
    console.log(`⚠️  No ${label} to sync.`)
    return
  }

  const chunks = chunkArray(prepared, SANITY_CHUNK_SIZE)
  for (let index = 0; index < chunks.length; index++) {
    const chunk = chunks[index]
    const tx = sanityClient.transaction()

    chunk.forEach(({id, createDoc, patchSet, setIfMissing}) => {
      tx.createIfNotExists(createDoc)
      tx.patch(id, (patch) => patch.set(patchSet).setIfMissing(setIfMissing))
    })

    await tx.commit({visibility: 'async'})
    console.log(`   • Committed ${label} chunk ${index + 1}/${chunks.length}`)
  }
}

function prepareGalleryDoc(gallery: DirectusGallery): PreparedDoc | null {
  if (!gallery.id || !gallery.galleryname) {
    return null
  }

  const galleryId = String(gallery.id)
  const slug = slugify(gallery.galleryname, galleryId)
  const docId = `gallery-${galleryId}`

  const workingHours = gallery.openinghours
    ? gallery.openinghours
        .split(';')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .join('\n')
    : undefined

  const geopoint =
    gallery.lat != null && gallery.lon != null
      ? {
          _type: 'geopoint',
          lat: gallery.lat,
          lng: gallery.lon,
        }
      : undefined

  const patchSet = cleanRecord({
    directusId: galleryId,
    name: gallery.galleryname,
    address: gallery.fulladdress,
    city: gallery.city,
    country: gallery.country,
    website: gallery.placeurl,
    workingHours,
    geopoint,
    syncedAt: SYNCED_AT,
  })

  return {
    id: docId,
    createDoc: {
      _id: docId,
      _type: 'gallery',
      directusId: galleryId,
      name: gallery.galleryname,
      slug: {_type: 'slug', current: slug},
    },
    patchSet,
    setIfMissing: {
      slug: {_type: 'slug', current: slug},
      directusId: galleryId,
    },
  }
}

function prepareArtistDoc(artist: DirectusArtist): PreparedDoc | null {
  if (!artist.id || !artist.name) {
    return null
  }

  const artistId = String(artist.id)
  const slug = slugify(artist.name, artistId)
  const docId = `artist-${artistId}`

  const patchSet = cleanRecord({
    directusId: artistId,
    name: artist.name,
    birthYear: artist.birth_year,
    country: artist.country,
    syncedAt: SYNCED_AT,
  })

  return {
    id: docId,
    createDoc: {
      _id: docId,
      _type: 'artist',
      directusId: artistId,
      name: artist.name,
      slug: {_type: 'slug', current: slug},
    },
    patchSet,
    setIfMissing: {
      slug: {_type: 'slug', current: slug},
      directusId: artistId,
    },
  }
}

function prepareExhibitionDoc(exhibition: DirectusExhibition): PreparedDoc | null {
  if (!exhibition.id || !exhibition.title) {
    return null
  }

  const exhibitionId = String(exhibition.id)
  const docId = `exhibition-${exhibitionId}`

  const patchSet = cleanRecord({
    directusId: exhibitionId,
    title: exhibition.title,
    description: exhibition.description,
    gallery: exhibition.gallery_id
      ? {
          _type: 'reference',
          _ref: `gallery-${exhibition.gallery_id}`,
        }
      : undefined,
    syncedAt: SYNCED_AT,
  })

  return {
    id: docId,
    createDoc: {
      _id: docId,
      _type: 'exhibition',
      directusId: exhibitionId,
      title: exhibition.title,
    },
    patchSet,
    setIfMissing: {
      directusId: exhibitionId,
    },
  }
}

async function syncGalleries() {
  console.log('\n→ Syncing galleries from Directus...')
  const galleries = await fetchCollection<DirectusGallery>('galleries', {
    fields: 'id,galleryname,fulladdress,city,country,lat,lon,placeurl,openinghours,newsletter_email,updated',
  })
  console.log(`   • Retrieved ${galleries.length} galleries`)
  const prepared = galleries.map(prepareGalleryDoc).filter(Boolean) as PreparedDoc[]
  await commitPreparedDocs(prepared, 'gallery')
  console.log('✓ Galleries synced')
}

async function syncArtists() {
  console.log('\n→ Syncing artists from Directus...')
  const artists = await fetchCollection<DirectusArtist>('artists', {
    fields: 'id,name,description,birth_year,country,date_updated',
  })
  console.log(`   • Retrieved ${artists.length} artists`)
  const prepared = artists.map(prepareArtistDoc).filter(Boolean) as PreparedDoc[]
  await commitPreparedDocs(prepared, 'artist')
  console.log('✓ Artists synced')
}

async function syncExhibitions() {
  console.log('\n→ Syncing exhibitions from Directus...')
  const exhibitions = await fetchCollection<DirectusExhibition>('exhibitions', {
    fields: 'id,title,description,gallery_id',
  })
  console.log(`   • Retrieved ${exhibitions.length} exhibitions`)
  const prepared = exhibitions.map(prepareExhibitionDoc).filter(Boolean) as PreparedDoc[]
  await commitPreparedDocs(prepared, 'exhibition')
  console.log('✓ Exhibitions synced')
}

async function run() {
  try {
    for (const target of targetsToSync) {
      if (!availableTargets.includes(target as SyncTarget)) {
        console.warn(`⚠️  Unknown target "${target}". Skipping.`)
        continue
      }

      if (target === 'galleries') await syncGalleries()
      if (target === 'artists') await syncArtists()
      if (target === 'exhibitions') await syncExhibitions()
    }

    console.log('\n✅ Sync complete!')
  } catch (error) {
    console.error('❌ Sync failed:', error)
    process.exit(1)
  }
}

run()