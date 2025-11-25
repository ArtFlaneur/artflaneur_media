import {createClient} from '@sanity/client'

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

const useCdn = process.env.SANITY_USE_CDN 
  ? process.env.SANITY_USE_CDN === 'true' 
  : (typeof import.meta !== 'undefined' && (import.meta as any).env?.PROD) || process.env.NODE_ENV === 'production'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  perspective: 'published',
})

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  studioUrl,
  useCdn,
}