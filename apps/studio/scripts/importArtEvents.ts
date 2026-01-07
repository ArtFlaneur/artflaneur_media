import {createClient} from '@sanity/client'
import * as fs from 'fs'
import * as path from 'path'
import {parse} from 'csv-parse/sync'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'o1yl0ri9',
  dataset: process.env.SANITY_STUDIO_DATASET || 'blog',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_STUDIO_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
  useCdn: false,
})

interface CSVRow {
  Name: string
  Email: string
  Type: string
  City: string
  Country: string
  Region: string
  Discipline: string
  'Start Date': string
  'End Date': string
  website: string
  Instagram: string
  Organaiser: string
}

function parseDate(dateStr: string): string | null {
  if (!dateStr || !dateStr.trim()) return null

  try {
    // Parse M/D/YYYY format
    const [month, day, year] = dateStr.split('/').map(Number)
    if (!month || !day || !year) return null

    // Create date object and format as YYYY-MM-DD
    const date = new Date(year, month - 1, day)
    if (isNaN(date.getTime())) return null

    return date.toISOString().split('T')[0]
  } catch (error) {
    console.warn(`Failed to parse date: ${dateStr}`)
    return null
  }
}

function normalizeUrl(url: string): string {
  if (!url || !url.trim()) return ''
  const trimmed = url.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  return `https://${trimmed}`
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function importArtEvents() {
  const csvPath = path.resolve(__dirname, '../../web/public/data/art-events.csv')

  console.log(`📂 Reading CSV file from: ${csvPath}`)

  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found!')
    return
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8').replace(/^\uFEFF/, '') // Remove BOM
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CSVRow[]

  console.log(`📊 Found ${records.length} events in CSV`)

  let imported = 0
  let skipped = 0
  let errors = 0

  for (const row of records) {
    try {
      const name = row.Name?.trim()
      if (!name) {
        skipped++
        continue
      }

      const startDate = parseDate(row['Start Date'])
      const endDate = parseDate(row['End Date'])

      if (!startDate || !endDate) {
        console.log(`⚠️  Skipping ${name}: invalid dates`)
        skipped++
        continue
      }

      const event = {
        _type: 'artEvent',
        _id: `artEvent-${createSlug(name)}`,
        name,
        slug: {
          _type: 'slug',
          current: createSlug(name),
        },
        type: row.Type?.trim() || 'Art Fair',
        discipline: row.Discipline?.trim() || '',
        startDate,
        endDate,
        city: row.City?.trim() || '',
        country: row.Country?.trim() || '',
        region: row.Region?.trim() || '',
        website: normalizeUrl(row.website),
        instagram: row.Instagram?.trim() || '',
        email: row.Email?.trim() || '',
        organizer: row.Organaiser?.trim() || '',
      }

      await client.createOrReplace(event)
      console.log(`✅ Imported: ${name}`)
      imported++
    } catch (error) {
      console.error(`❌ Error importing ${row.Name}:`, error)
      errors++
    }
  }

  console.log('\n📈 Import Summary:')
  console.log(`   ✅ Imported: ${imported}`)
  console.log(`   ⚠️  Skipped: ${skipped}`)
  console.log(`   ❌ Errors: ${errors}`)
}

importArtEvents().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
