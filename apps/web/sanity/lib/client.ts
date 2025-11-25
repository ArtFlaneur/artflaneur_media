import {createClient} from '@sanity/client'

// Debug: выводим все переменные окружения
console.log('🌍 Environment check:', {
  'import.meta.env': typeof import.meta !== 'undefined' ? (import.meta as any).env : 'not available',
  'VITE_SANITY_PROJECT_ID': (import.meta as any).env?.VITE_SANITY_PROJECT_ID,
  'VITE_SANITY_DATASET': (import.meta as any).env?.VITE_SANITY_DATASET,
});

const projectId =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SANITY_PROJECT_ID) ||
  process.env.SANITY_PROJECT_ID ||
  process.env.SANITY_STUDIO_PROJECT_ID ||
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.PUBLIC_SANITY_PROJECT_ID

const dataset =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SANITY_DATASET) ||
  process.env.SANITY_DATASET ||
  process.env.SANITY_STUDIO_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.PUBLIC_SANITY_DATASET

const apiVersion = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SANITY_API_VERSION) ||
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || 
  '2024-01-01'

const token = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SANITY_TOKEN) ||
  process.env.SANITY_TOKEN ||
  process.env.NEXT_PUBLIC_SANITY_TOKEN

if (!projectId || !dataset) {
  throw new Error(
    'Missing Sanity configuration. Add SANITY_PROJECT_ID and SANITY_DATASET to apps/web/.env.local (or set SANITY_STUDIO_* variables).'
  )
}

const studioUrl =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SANITY_STUDIO_URL) ||
  process.env.SANITY_STUDIO_URL ||
  process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ||
  'https://art-flaneur.sanity.studio'

// Use CDN false for development to avoid caching issues
const useCdn = false

console.log('🔧 Sanity Client Config:', {
  projectId,
  dataset,
  apiVersion,
  useCdn,
  perspective: 'raw',
  hasToken: !!token
});

export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token, // Add authentication token
  useCdn: false, // Disable CDN to get fresh data
  perspective: 'raw', // Get all documents
})

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  studioUrl,
  useCdn,
}