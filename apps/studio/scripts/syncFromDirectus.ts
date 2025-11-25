import {createClient} from '@sanity/client'

const sanityClient = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '',
  dataset: process.env.SANITY_STUDIO_DATASET || 'blog',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const DIRECTUS_URL = process.env.DIRECTUS_URL || ''
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || ''

async function fetchFromDirectus(collection: string) {
  const response = await fetch(`${DIRECTUS_URL}/items/${collection}?limit=-1`, {
    headers: {
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    },
  })
  const json = await response.json()
  return json.data
}

// Добавьте функцию поиска вместо полной синхронизации
async function searchAndSyncGallery(searchTerm: string) {
  console.log(`Searching for gallery: ${searchTerm}`)
  const response = await fetch(
    `${DIRECTUS_URL}/items/galleries?search=${encodeURIComponent(searchTerm)}&limit=50`,
    {
      headers: {
        'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
      },
    }
  )
  const json = await response.json()
  return json.data
}

// Синхронизируйте только используемые галереи
async function syncUsedGalleriesOnly() {
  console.log('Syncing only galleries used in exhibitions...')
  
  // Получите уникальные gallery_id из exhibitions
  const exhibitions = await fetchFromDirectus('exhibitions')
  const uniqueGalleryIds = [...new Set(exhibitions.map((e: any) => e.gallery_id).filter(Boolean))]
  
  console.log(`Found ${uniqueGalleryIds.length} unique galleries in use`)
  
  for (const galleryId of uniqueGalleryIds) {
    const gallery = await fetch(`${DIRECTUS_URL}/items/galleries/${galleryId}`, {
      headers: {'Authorization': `Bearer ${DIRECTUS_TOKEN}`}
    }).then(r => r.json())
    
    if (gallery.data) {
      await sanityClient.createOrReplace({
        _id: `gallery-${gallery.data.id}`,
        _type: 'gallery',
        directusId: gallery.data.id.toString(),
        name: gallery.data.name,
        city: gallery.data.city,
        country: gallery.data.country,
      })
    }
  }
  
  console.log(`✓ Synced ${uniqueGalleryIds.length} galleries`)
}

async function syncExhibitions() {
  console.log('Syncing exhibitions...')
  const exhibitions = await fetchFromDirectus('exhibitions')
  
  for (const exhibition of exhibitions) {
    await sanityClient.createOrReplace({
      _id: `exhibition-${exhibition.id}`,
      _type: 'exhibition',
      directusId: exhibition.id.toString(),
      title: exhibition.title,
      startDate: exhibition.start_date,
      endDate: exhibition.end_date,
      gallery: exhibition.gallery_id ? {
        _type: 'reference',
        _ref: `gallery-${exhibition.gallery_id}`
      } : undefined,
    })
  }
  console.log(`✓ Synced ${exhibitions.length} exhibitions`)
}

async function syncArtists() {
  console.log('Syncing artists...')
  const artists = await fetchFromDirectus('artists')
  
  for (const artist of artists) {
    await sanityClient.createOrReplace({
      _id: `artist-${artist.id}`,
      _type: 'artist',
      directusId: artist.id.toString(),
      name: artist.name,
      bio: artist.bio,
    })
  }
  console.log(`✓ Synced ${artists.length} artists`)
}

async function syncAll() {
  try {
    await syncUsedGalleriesOnly() // Вместо syncGalleries()
    await syncExhibitions()
    await syncArtists()
    console.log('\n✅ Sync complete!')
  } catch (error) {
    console.error('❌ Sync failed:', error)
    process.exit(1)
  }
}

syncAll()