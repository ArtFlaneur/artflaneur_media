
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

async function fetchExhibitionsFromDirectus() {
  const response = await fetch(`${DIRECTUS_URL}/items/exhibitions`, {
    headers: {
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    },
  })
  return response.json()
}

async function importExhibitions() {
  console.log('Fetching exhibitions from Directus...')
  const {data} = await fetchExhibitionsFromDirectus()
  
  console.log(`Importing ${data.length} exhibitions...`)
  
  for (const exhibition of data) {
    await sanityClient.createOrReplace({
      _id: `exhibition-${exhibition.id}`,
      _type: 'exhibition',
      directusId: exhibition.id.toString(),
      title: exhibition.title,
      gallery: exhibition.gallery_id ? {
        _type: 'reference',
        _ref: `gallery-${exhibition.gallery_id}`,
      } : undefined,
      startDate: exhibition.start_date,
      endDate: exhibition.end_date,
    })
  }
  
  console.log('Import complete!')
}

importExhibitions().catch(console.error)