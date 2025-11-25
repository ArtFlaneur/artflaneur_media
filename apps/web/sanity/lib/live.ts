import type {ClientPerspective} from '@sanity/client'

import {client} from './client'
import {token} from './token'

type LiveFetchOptions = {
  perspective?: ClientPerspective
  useDraftToken?: boolean
}

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  options: LiveFetchOptions = {}
) {
  return client.fetch<T>(query, params, {
    perspective: options.perspective || (options.useDraftToken ? 'previewDrafts' : 'published'),
    token: options.useDraftToken ? token : undefined,
  })
}

export const SanityLive = {
  subscribe: () => {
    throw new Error('Sanity live preview is not initialized yet. Implement Presentation Tool wiring in apps/web.')
  },
}