import {createClient} from '@sanity/client'
import type {Gallery, ExhibitionSubmission} from './database.types'

const SANITY_PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID
const SANITY_DATASET = import.meta.env.VITE_SANITY_DATASET
const SANITY_API_VERSION = import.meta.env.VITE_SANITY_API_VERSION || '2024-01-01'
const SANITY_WRITE_TOKEN = import.meta.env.VITE_SANITY_WRITE_TOKEN

if (!SANITY_WRITE_TOKEN) {
  console.warn('⚠️ VITE_SANITY_WRITE_TOKEN is not set. Admin moderation cannot sync newly approved submissions to Sanity.')
}

let cachedSanityClient: ReturnType<typeof createClient> | null = null

const getSanityWriteClient = () => {
  if (cachedSanityClient) return cachedSanityClient

  if (!SANITY_WRITE_TOKEN) {
    throw new Error('Set VITE_SANITY_WRITE_TOKEN in apps/web/.env.local to enable Sanity syncs from the admin dashboard.')
  }

  if (!SANITY_PROJECT_ID || !SANITY_DATASET) {
    throw new Error('Sanity project settings are missing. Check VITE_SANITY_PROJECT_ID and VITE_SANITY_DATASET.')
  }

  cachedSanityClient = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    token: SANITY_WRITE_TOKEN,
    useCdn: false,
    perspective: 'published',
  })

  return cachedSanityClient
}

const slugify = (value: string, fallback: string) => {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

  return base || fallback
}

const toIsoString = (value?: string | null) => {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString()
}

const truncate = (value: string, max = 240) => {
  return value.length <= max ? value : `${value.slice(0, max - 1).trim()}...`
}

const galleryLookupQuery = '*[_type == "gallery" && supabaseId == $supabaseId][0]{_id}'
const exhibitionLookupQuery = '*[_type == "exhibition" && supabaseId == $supabaseId][0]{_id}'

const ensureGalleryDocument = async (gallery: Gallery) => {
  const client = getSanityWriteClient()
  const existing = await client.fetch<{_id: string} | null>(galleryLookupQuery, {supabaseId: gallery.id})

  const summarySource = gallery.description?.trim() || `Independent program submitted by ${gallery.name}`
  const summary = truncate(summarySource)
  const description = gallery.description?.trim() || `${gallery.name} shared this profile via the gallery dashboard.`
  const slugSuffix = gallery.id.replace(/[^a-z0-9]+/gi, '').slice(-6) || 'sync'
  const slug = slugify(`${gallery.name}-${slugSuffix}`, `gallery-${slugSuffix}`)

  const baseFields = {
    name: gallery.name,
    summary,
    description,
    address: gallery.address ?? null,
    supabaseId: gallery.id,
    contact: {
      phone: gallery.phone ?? null,
      email: gallery.email ?? null,
    },
  }

  if (existing?._id) {
    await client
      .patch(existing._id)
      .set(baseFields)
      .setIfMissing({slug: {current: slug}})
      .commit()

    return existing._id
  }

  const newDocId = `gallery.supabase.${gallery.id}`

  const created = await client.create({
    _id: newDocId,
    _type: 'gallery',
    ...baseFields,
    slug: {current: slug},
  })

  return created._id
}

const ensureExhibitionDocument = async (payload: ExhibitionSyncPayload, galleryRef: string) => {
  const client = getSanityWriteClient()
  const existing = await client.fetch<{_id: string} | null>(exhibitionLookupQuery, {supabaseId: payload.id})

  const slugSuffix = payload.id.replace(/[^a-z0-9]+/gi, '').slice(-6) || 'sync'
  const slug = slugify(`${payload.title}-${slugSuffix}`, `exhibition-${slugSuffix}`)
  const ticketingAccess = payload.ticketing_access ?? 'free'
  const ticketingDetails = payload.ticketing_price || payload.ticketing_link || payload.ticketing_cta_label
  const baseFields: Record<string, unknown> = {
    title: payload.title,
    description: payload.description ?? '',
    startDate: toIsoString(payload.start_date),
    endDate: toIsoString(payload.end_date),
    gallery: {
      _type: 'reference',
      _ref: galleryRef,
    },
    supabaseId: payload.id,
  }

  if (ticketingAccess || ticketingDetails) {
    baseFields.ticketing = {
      access: ticketingAccess,
      ticketPrice: payload.ticketing_price ?? undefined,
      bookingUrl: payload.ticketing_link ?? undefined,
      ctaLabel: payload.ticketing_cta_label ?? undefined,
    }
  }

  if (existing?._id) {
    const patch = client.patch(existing._id).set(baseFields).setIfMissing({slug: {current: slug}})
    if (!baseFields.ticketing) {
      patch.unset(['ticketing'])
    }
    await patch.commit()
    return existing._id
  }

  const newDocId = `exhibition.supabase.${payload.id}`

  const created = await client.create({
    _id: newDocId,
    _type: 'exhibition',
    ...baseFields,
    slug: {current: slug},
  })

  return created._id
}

export type ExhibitionSyncPayload = ExhibitionSubmission & {
  gallery: Gallery
}

export type SyncedExhibition = {
  sanityExhibitionId: string
  sanityGalleryId: string
}

export const syncExhibitionToSanity = async (payload: ExhibitionSyncPayload): Promise<SyncedExhibition> => {
  if (!payload.gallery) {
    throw new Error('Submission is missing gallery context, so it cannot be synced to Sanity.')
  }

  const sanityGalleryId = await ensureGalleryDocument(payload.gallery)
  const sanityExhibitionId = await ensureExhibitionDocument(payload, sanityGalleryId)

  return {sanityExhibitionId, sanityGalleryId}
}
