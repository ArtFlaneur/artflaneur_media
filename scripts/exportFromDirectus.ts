import fs from 'fs'
import path from 'path'

const DIRECTUS_URL = process.env.DIRECTUS_URL || ''
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || ''

async function fetchFromDirectus(endpoint: string, params: Record<string, any> = {}) {
  const url = new URL(`${DIRECTUS_URL}${endpoint}`)
  
  // Добавляем параметры для получения всех полей и связей
  url.searchParams.append('limit', '-1') // получить все записи
  url.searchParams.append('fields', '*.*') // получить все поля включая связанные
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value))
  })

  const response = await fetch(url.toString(), {
    headers: {'Authorization': `Bearer ${DIRECTUS_TOKEN}`},
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`)
  }

  const result = await response.json()
  
  if (!result.data) {
    throw new Error(`Invalid response structure from ${endpoint}: missing 'data' field`)
  }

  return result.data
}

async function exportData() {
  try {
    console.log('🔄 Starting export from Directus...')
    console.log(`📡 Directus URL: ${DIRECTUS_URL}`)
    
    if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
      throw new Error('DIRECTUS_URL and DIRECTUS_TOKEN must be set in environment variables')
    }

    console.log('\n📚 Exporting galleries...')
    const galleries = await fetchFromDirectus('/items/galleries')
    console.log(`✅ Exported ${galleries.length} galleries`)

    console.log('\n👨‍🎨 Exporting artists...')
    const artists = await fetchFromDirectus('/items/artists')
    console.log(`✅ Exported ${artists.length} artists`)

    console.log('\n🎨 Exporting exhibitions...')
    const exhibitions = await fetchFromDirectus('/items/exhibitions')
    console.log(`✅ Exported ${exhibitions.length} exhibitions`)

    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    const galleriesPath = path.join(dataDir, 'galleries.json')
    fs.writeFileSync(galleriesPath, JSON.stringify(galleries, null, 2))
    console.log(`💾 Saved galleries to ${galleriesPath}`)

    const artistsPath = path.join(dataDir, 'artists.json')
    fs.writeFileSync(artistsPath, JSON.stringify(artists, null, 2))
    console.log(`💾 Saved artists to ${artistsPath}`)

    const exhibitionsPath = path.join(dataDir, 'exhibitions.json')
    fs.writeFileSync(exhibitionsPath, JSON.stringify(exhibitions, null, 2))
    console.log(`💾 Saved exhibitions to ${exhibitionsPath}`)

    console.log('\n✨ Export complete!')
    
  } catch (error) {
    console.error('\n❌ Export failed:', error)
    process.exit(1)
  }
}

exportData()