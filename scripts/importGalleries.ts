
import {createClient} from '@sanity/client'

const sanityClient = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '',
  dataset: process.env.SANITY_STUDIO_DATASET || 'blog',
  token: process.env.SANITY_API_TOKEN, // Нужен write token
  apiVersion: '2024-01-01',
  useCdn: false,
})

const DIRECTUS_URL = process.env.DIRECTUS_URL || ''
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || ''

async function fetchGalleriesFromDirectus() {
  const response = await fetch(`${DIRECTUS_URL}/items/galleries`, {
    headers: {
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    },
  })
  return response.json()
}

async function importGalleries() {
  console.log('Fetching galleries from Directus...')
  const {data} = await fetchGalleriesFromDirectus()
  
  console.log(`Importing ${data.length} galleries...`)
  
  for (const gallery of data) {
    await sanityClient.createOrReplace({
      _id: `gallery-${gallery.id}`,
      _type: 'gallery',
      directusId: gallery.id.toString(),
      name: gallery.name,
      city: gallery.city,
      country: gallery.country,
    })
  }
  
  console.log('Import complete!')
}

importGalleries().catch(console.error)