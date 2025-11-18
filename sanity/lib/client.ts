import {createClient} from '@sanity/client'

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_STUDIO_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID

const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_STUDIO_DATASET ||
  process.env.SANITY_DATASET

const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'

if (!projectId || !dataset) {
  throw new Error('Missing Sanity project configuration. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET')
}

const studioUrl =
  process.env.SANITY_STUDIO_URL ||
  process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ||
  'https://art-flaneur.sanity.studio'

const useCdn = process.env.SANITY_USE_CDN ? process.env.SANITY_USE_CDN === 'true' : process.env.NODE_ENV === 'production'

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