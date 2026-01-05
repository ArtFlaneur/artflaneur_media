import type {Gallery, ExhibitionSubmission} from './database.types'

export type ExhibitionSyncPayload = ExhibitionSubmission & {
  gallery: Gallery
}

export type SyncedExhibition = {
  sanityExhibitionId: string
  sanityGalleryId: string
}

/**
 * Syncs an exhibition to Sanity via the secure Edge Function.
 * This keeps the write token on the server side only.
 */
export const syncExhibitionToSanity = async (payload: ExhibitionSyncPayload): Promise<SyncedExhibition> => {
  if (!payload.gallery) {
    throw new Error('Submission is missing gallery context, so it cannot be synced to Sanity.')
  }

  // Call the Edge Function instead of directly accessing Sanity
  const response = await fetch('/api/sanity-sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      exhibition: payload,
      gallery: payload.gallery,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.details || error.error || 'Failed to sync to Sanity');
  }

  const result = await response.json();
  return {
    sanityExhibitionId: result.sanityExhibitionId,
    sanityGalleryId: result.sanityGalleryId,
  };
}
