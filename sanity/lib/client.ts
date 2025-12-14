import {createClient} from '@sanity/client'

const getViteEnv = (key: string): string | undefined => {
  const env = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined
  return env?.[key]
}

const getProcessEnv = (key: string): string | undefined => {
  const env = typeof process !== 'undefined' ? (process as any).env : undefined
  return env?.[key]
}

const projectId =
  getViteEnv('VITE_SANITY_PROJECT_ID') ||
  getProcessEnv('SANITY_PROJECT_ID') ||
  getProcessEnv('SANITY_STUDIO_PROJECT_ID') ||
  getProcessEnv('NEXT_PUBLIC_SANITY_PROJECT_ID') ||
  getProcessEnv('PUBLIC_SANITY_PROJECT_ID')

const dataset =
  getViteEnv('VITE_SANITY_DATASET') ||
  getProcessEnv('SANITY_DATASET') ||
  getProcessEnv('SANITY_STUDIO_DATASET') ||
  getProcessEnv('NEXT_PUBLIC_SANITY_DATASET') ||
  getProcessEnv('PUBLIC_SANITY_DATASET')

const apiVersion =
  getViteEnv('VITE_SANITY_API_VERSION') || getProcessEnv('NEXT_PUBLIC_SANITY_API_VERSION') || '2024-01-01'

if (!projectId || !dataset) {
  throw new Error(
    'Missing Sanity configuration. Set VITE_SANITY_PROJECT_ID and VITE_SANITY_DATASET (apps/web/.env.local) or SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET (apps/studio/.env).'
  )
}

const studioUrl =
  getViteEnv('VITE_SANITY_STUDIO_URL') ||
  getProcessEnv('SANITY_STUDIO_URL') ||
  getProcessEnv('NEXT_PUBLIC_SANITY_STUDIO_URL') ||
  'https://art-flaneur.sanity.studio'

const useCdn = getProcessEnv('SANITY_USE_CDN')
  ? getProcessEnv('SANITY_USE_CDN') === 'true'
  : Boolean(getViteEnv('PROD')) || getProcessEnv('NODE_ENV') === 'production'

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