// Vercel Edge Function - secure Sanity write operations
import { createClient } from '@sanity/client';

export const config = {
  runtime: 'edge',
};

// Type definitions
interface Gallery {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}

interface ExhibitionSubmission {
  id: string;
  title: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  artists?: string[] | null;
  curators?: string[] | null;
  ticketing_access?: string | null;
  ticketing_price?: string | null;
  ticketing_link?: string | null;
  ticketing_cta_label?: string | null;
}

interface SyncPayload {
  exhibition: ExhibitionSubmission;
  gallery: Gallery;
}

// Helper functions
const slugify = (value: string, fallback: string): string => {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  return base || fallback;
};

const toIsoString = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString();
};

const truncate = (value: string, max = 240): string => {
  return value.length <= max ? value : `${value.slice(0, max - 1).trim()}...`;
};

// Sanity operations
const ensureGalleryDocument = async (client: ReturnType<typeof createClient>, gallery: Gallery): Promise<string> => {
  const galleryLookupQuery = '*[_type == "gallery" && supabaseId == $supabaseId][0]{_id}';
  const existing = await client.fetch(galleryLookupQuery, { supabaseId: gallery.id }) as { _id: string } | null;

  const summarySource = gallery.description?.trim() || `Independent program submitted by ${gallery.name}`;
  const summary = truncate(summarySource);
  const description = gallery.description?.trim() || `${gallery.name} shared this profile via the gallery dashboard.`;
  const slugSuffix = gallery.id.replace(/[^a-z0-9]+/gi, '').slice(-6) || 'sync';
  const slug = slugify(`${gallery.name}-${slugSuffix}`, `gallery-${slugSuffix}`);

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
  };

  if (existing?._id) {
    await client
      .patch(existing._id)
      .set(baseFields)
      .setIfMissing({ slug: { current: slug } })
      .commit();

    return existing._id;
  }

  const newDocId = `gallery.supabase.${gallery.id}`;

  const created = await client.create({
    _id: newDocId,
    _type: 'gallery',
    ...baseFields,
    slug: { current: slug },
  });

  return created._id;
};

const ensureExhibitionDocument = async (
  client: ReturnType<typeof createClient>,
  exhibition: ExhibitionSubmission,
  galleryRef: string
): Promise<string> => {
  const exhibitionLookupQuery = '*[_type == "exhibition" && supabaseId == $supabaseId][0]{_id}';
  const existing = await client.fetch(exhibitionLookupQuery, { supabaseId: exhibition.id }) as { _id: string } | null;

  const slugSuffix = exhibition.id.replace(/[^a-z0-9]+/gi, '').slice(-6) || 'sync';
  const slug = slugify(`${exhibition.title}-${slugSuffix}`, `exhibition-${slugSuffix}`);
  const ticketingAccess = exhibition.ticketing_access ?? 'free';
  const ticketingDetails = exhibition.ticketing_price || exhibition.ticketing_link || exhibition.ticketing_cta_label;

  const baseFields: Record<string, unknown> = {
    title: exhibition.title,
    description: exhibition.description ?? '',
    startDate: toIsoString(exhibition.start_date),
    endDate: toIsoString(exhibition.end_date),
    gallery: {
      _type: 'reference',
      _ref: galleryRef,
    },
    supabaseId: exhibition.id,
  };

  if (ticketingAccess || ticketingDetails) {
    baseFields.ticketing = {
      access: ticketingAccess,
      ticketPrice: exhibition.ticketing_price ?? undefined,
      bookingUrl: exhibition.ticketing_link ?? undefined,
      ctaLabel: exhibition.ticketing_cta_label ?? undefined,
    };
  }

  if (existing?._id) {
    const patch = client.patch(existing._id).set(baseFields).setIfMissing({ slug: { current: slug } });
    if (!baseFields.ticketing) {
      patch.unset(['ticketing']);
    }
    await patch.commit();
    return existing._id;
  }

  const newDocId = `exhibition.supabase.${exhibition.id}`;

  const created = await client.create({
    _id: newDocId,
    _type: 'exhibition',
    ...baseFields,
    slug: { current: slug },
  });

  return created._id;
};

export default async function handler(request: Request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  // Get server-side environment variables (without VITE_ prefix)
  const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID;
  const SANITY_DATASET = process.env.SANITY_DATASET;
  const SANITY_API_VERSION = process.env.SANITY_API_VERSION || '2024-01-01';
  const SANITY_WRITE_TOKEN = process.env.SANITY_WRITE_TOKEN;

  if (!SANITY_WRITE_TOKEN || !SANITY_PROJECT_ID || !SANITY_DATASET) {
    return new Response(
      JSON.stringify({
        error: 'Sanity configuration missing on server',
        details: 'Please set SANITY_WRITE_TOKEN, SANITY_PROJECT_ID, and SANITY_DATASET environment variables',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    // Parse request body
    const body: SyncPayload = await request.json();
    const { exhibition, gallery } = body;

    if (!exhibition || !gallery) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: exhibition and gallery' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Create Sanity client with write token
    const sanityClient = createClient({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      apiVersion: SANITY_API_VERSION,
      token: SANITY_WRITE_TOKEN,
      useCdn: false,
      perspective: 'published',
    });

    // Sync to Sanity
    const sanityGalleryId = await ensureGalleryDocument(sanityClient, gallery);
    const sanityExhibitionId = await ensureExhibitionDocument(sanityClient, exhibition, sanityGalleryId);

    return new Response(
      JSON.stringify({
        success: true,
        sanityExhibitionId,
        sanityGalleryId,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Sanity sync error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to sync to Sanity',
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
