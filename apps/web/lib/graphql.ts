import { normalizeCountry } from './countries';

const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT;
const GRAPHQL_API_KEY = import.meta.env.VITE_GRAPHQL_API_KEY;
const GRAPHQL_TENANT_ID = import.meta.env.VITE_GRAPHQL_TENANT_ID || 'artflaneur';

if (!GRAPHQL_ENDPOINT || !GRAPHQL_API_KEY) {
  console.warn(
    '⚠️ GraphQL API is not fully configured. Set VITE_GRAPHQL_ENDPOINT and VITE_GRAPHQL_API_KEY to enable API access.'
  );
}

const LIST_HISTORICAL_EXHIBITIONS_QUERY = `#graphql
  query ListHistoricalExhibitions($limit: Int, $nextToken: String) {
    listAllHistoricalExhibitions(limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        artist
        galleryname
        datefrom_epoch
        dateto_epoch
        eventtype
        exhibition_img_url
      }
      nextToken
    }
  }
`;

const GET_EXHIBITION_BY_ID_QUERY = `#graphql
  query GetExhibitionById($id: ID!) {
    getExhibitionById(id: $id) {
      id
      gallery_id
      galleryname
      city
      title
      description
      artist
      eventtype
      exhibition_type
      exhibition_img_url
      logo_img_url
      datefrom
      dateto
      datefrom_epoch
      dateto_epoch
    }
  }
`;

interface GraphqlResponse<T> {
  data: T;
  errors?: Array<{
    message?: string;
  }>;
}

export interface GraphqlGallery {
  id: string;
  galleryname: string;
  placeurl?: string | null;
  openinghours?: string | null;
  specialevent?: string | null;
  eventtype?: string | null;
  allowed?: string | null;
  country?: string | null;
  fulladdress?: string | null;
  gallery_img_url?: string | null;
  logo_img_url?: string | null;
  lat?: number | string | null;
  lon?: number | string | null;
  city?: string | null; // derived client-side when not provided by the API
  distanceInKm?: number | null;
}

export interface GraphqlExhibition {
  id: string;
  gallery_id?: string | null;
  galleryname?: string | null;
  title?: string | null;
  description?: string | null;
  artist?: string | null;
  city?: string | null;
  eventtype?: string | null;
  exhibition_type?: string[] | string | null;
  exhibition_img_url?: string | null;
  logo_img_url?: string | null;
  datefrom?: string | null;
  dateto?: string | null;
  datefrom_epoch?: number | null;
  dateto_epoch?: number | null;
}

export interface GraphqlListResult<T> {
  items: T[];
  nextToken?: string | null;
}

export interface GalleryFilterStringInput {
  eq?: string;
  contains?: string;
  beginsWith?: string;
}

export interface GalleryFilterInput {
  country?: GalleryFilterStringInput;
  city?: GalleryFilterStringInput;
  galleryname?: GalleryFilterStringInput;
  fulladdress?: GalleryFilterStringInput;
  or?: GalleryFilterInput[];
}

async function executeGraphQL<T>(query: string, variables?: Record<string, any>): Promise<T> {
  if (!GRAPHQL_ENDPOINT || !GRAPHQL_API_KEY) {
    throw new Error('GraphQL API is not configured. Please set VITE_GRAPHQL_ENDPOINT and VITE_GRAPHQL_API_KEY.');
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': GRAPHQL_API_KEY,
      'x-tenant-id': GRAPHQL_TENANT_ID,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GraphQL request failed (${response.status}): ${errorText}`);
  }

  const payload = (await response.json()) as GraphqlResponse<T>;

  if (payload.errors?.length) {
    const [firstError] = payload.errors;
    throw new Error(firstError?.message || 'GraphQL request returned an error');
  }

  return payload.data;
}

const LIST_GALLERIES_QUERY = `#graphql
  query ListGalleries($limit: Int, $nextToken: String, $filter: GalleryFilterInput) {
    listGalleriesById(limit: $limit, nextToken: $nextToken, filter: $filter) {
      items {
        id
        galleryname
        country
        fulladdress
        lat
        lon
        placeurl
        openinghours
        specialevent
        eventtype
        allowed
        gallery_img_url
        logo_img_url
      }
      nextToken
    }
  }
`;

const GET_GALLERY_QUERY = `#graphql
  query GetGalleryById($id: ID!) {
    getGalleryById(id: $id) {
      id
      galleryname
      country
      fulladdress
      lat
      lon
      placeurl
      openinghours
      specialevent
      eventtype
      allowed
      gallery_img_url
      logo_img_url
    }
  }
`;

/**
 * Derive city name from full address by extracting the last segment before country.
 * Example: "123 Main St, New York, NY, USA" -> "New York"
 */
const deriveCityFromAddress = (address?: string | null, country?: string | null): string | undefined => {
  if (!address?.trim()) {
    return undefined;
  }

  const normalizedCountry = country?.trim().toLowerCase();
  const segments = address
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    return undefined;
  }

  // Remove country from end if it matches
  if (normalizedCountry && segments.length > 1) {
    const last = segments[segments.length - 1];
    if (last?.toLowerCase() === normalizedCountry) {
      segments.pop();
    }
  }

  // Get the last remaining segment as city candidate
  const candidate = segments[segments.length - 1] ?? '';
  const tokens = candidate.split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    return undefined;
  }

  // Filter out postal codes and state abbreviations
  const letterPattern = /\p{L}/u;
  const regionPattern = /^[A-Z]{1,3}$/;
  const cityTokens: string[] = [];
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    const token = tokens[index];
    if (!letterPattern.test(token)) {
      continue;
    }
    if (regionPattern.test(token)) {
      continue;
    }
    cityTokens.unshift(token);
  }

  const derived = cityTokens.join(' ').trim();
  return derived || candidate || undefined;
};

/**
 * Enrich gallery with derived city if not provided by API.
 */
const enrichGallery = <T extends GraphqlGallery>(gallery: T): T => {
  if (gallery.city) {
    return gallery;
  }

  const derivedCity = deriveCityFromAddress(gallery.fulladdress, gallery.country);
  return {
    ...gallery,
    city: derivedCity ?? null,
  };
};

const LIST_EXHIBITIONS_QUERY = `#graphql
  query ListAllExhibitions($limit: Int, $nextToken: String) {
    listAllExhibitions(limit: $limit, nextToken: $nextToken) {
      items {
        id
        gallery_id
        galleryname
        city
        title
        description
        artist
        eventtype
        exhibition_type
        exhibition_img_url
        logo_img_url
        datefrom
        dateto
        datefrom_epoch
        dateto_epoch
      }
      nextToken
    }
  }
`;

const LIST_EXHIBITIONS_BY_GALLERY_QUERY = `#graphql
  query ListExhibitionsByGallery($galleryId: ID!, $limit: Int, $nextToken: String) {
    listExhibitionsByGalleryId(galleryId: $galleryId, limit: $limit, nextToken: $nextToken) {
      items {
        id
        gallery_id
        galleryname
        city
        title
        description
        artist
        eventtype
        exhibition_type
        exhibition_img_url
        logo_img_url
        datefrom
        dateto
        datefrom_epoch
        dateto_epoch
      }
      nextToken
    }
  }
`;

const LIST_HISTORICAL_EXHIBITIONS_BY_GALLERY_ID_QUERY = `#graphql
  query ListHistoricalExhibitionsByGalleryId($galleryId: ID!, $limit: Int, $nextToken: String) {
    listHistoricalExhibitionsByGalleryId(galleryId: $galleryId, limit: $limit, nextToken: $nextToken) {
      items {
        id
        gallery_id
        galleryname
        city
        title
        description
        artist
        eventtype
        exhibition_type
        exhibition_img_url
        logo_img_url
        datefrom
        dateto
        datefrom_epoch
        dateto_epoch
      }
      nextToken
    }
  }
`;

export interface FetchGalleriesParams {
  limit?: number;
  nextToken?: string | null;
  filter?: GalleryFilterInput;
}

/**
 * Check if a gallery should be excluded from display.
 * Excludes galleries with allowed="No" or specialevent="yes" (temporary venues).
 */
export const isGalleryExcluded = (gallery: GraphqlGallery): boolean => {
  // Exclude if allowed is explicitly "No"
  if (gallery.allowed?.toLowerCase() === 'no') {
    return true;
  }
  // Exclude temporary event venues
  if (gallery.specialevent?.toLowerCase() === 'yes') {
    return true;
  }
  return false;
};

export async function fetchGalleries(params: FetchGalleriesParams = {}): Promise<GraphqlListResult<GraphqlGallery>> {
  const variables = {
    limit: params.limit,
    nextToken: params.nextToken,
    filter: params.filter,
  };

  const data = await executeGraphQL<{ listGalleriesById: GraphqlListResult<GraphqlGallery> }>(
    LIST_GALLERIES_QUERY,
    variables
  );

  const connection = data.listGalleriesById ?? { items: [], nextToken: null };
  // Enrich with derived city and filter out excluded galleries
  const enrichedItems = (connection.items ?? []).map(enrichGallery);
  const filteredItems = enrichedItems.filter((g) => !isGalleryExcluded(g));
  
  return {
    ...connection,
    items: filteredItems,
  };
}

/**
 * Approximate total number of galleries in the database.
 * This is a cached value that should be updated periodically.
 * Last updated: December 2025
 */
export const APPROXIMATE_GALLERY_COUNT = 13000;

/**
 * Count galleries by country using pagination.
 * Iterates through all pages to get exact count.
 */
export async function countGalleriesByCountry(countryAliases: string[]): Promise<number> {
  if (!countryAliases.length) {
    return 0;
  }

  let filter: GalleryFilterInput;
  if (countryAliases.length === 1) {
    filter = { country: { eq: countryAliases[0] } };
  } else {
    filter = { or: countryAliases.map(alias => ({ country: { eq: alias } })) };
  }

  let count = 0;
  let nextToken: string | null = null;
  const BATCH_SIZE = 100;

  do {
    const variables = {
      limit: BATCH_SIZE,
      nextToken,
      filter,
    };

    const data = await executeGraphQL<{ listGalleriesById: GraphqlListResult<GraphqlGallery> }>(
      LIST_GALLERIES_QUERY,
      variables
    );

    const connection = data.listGalleriesById ?? { items: [], nextToken: null };
    const filteredItems = (connection.items ?? []).filter((g) => !isGalleryExcluded(g));
    count += filteredItems.length;
    nextToken = connection.nextToken ?? null;
  } while (nextToken);

  return count;
}

export async function searchGalleries(query: string, limit = 50): Promise<GraphqlGallery[]> {
  if (!query.trim()) {
    return [];
  }

  const filter: GalleryFilterInput = {
    or: [
      { galleryname: { contains: query } },
      { city: { contains: query } },
      { country: { contains: query } },
      { fulladdress: { contains: query } },
    ],
  };

  const result = await fetchGalleries({ limit, filter });
  return result.items ?? [];
}

export async function fetchExhibitions(limit = 50): Promise<GraphqlExhibition[]> {
  const data = await executeGraphQL<{ listAllExhibitions: GraphqlListResult<GraphqlExhibition> }>(
    LIST_EXHIBITIONS_QUERY,
    { limit }
  );
  return data.listAllExhibitions?.items ?? [];
}

export async function fetchExhibitionsPage(
  params: { limit?: number; nextToken?: string | null } = {},
): Promise<GraphqlListResult<GraphqlExhibition>> {
  const data = await executeGraphQL<{ listAllExhibitions: GraphqlListResult<GraphqlExhibition> }>(
    LIST_EXHIBITIONS_QUERY,
    {
      limit: params.limit,
      nextToken: params.nextToken,
    },
  );

  return data.listAllExhibitions ?? { items: [], nextToken: null };
}

export async function fetchHistoricalExhibitionsPage(
  params: { limit?: number; nextToken?: string | null } = {},
): Promise<GraphqlListResult<GraphqlExhibition>> {
  const data = await executeGraphQL<{
    listAllHistoricalExhibitions: GraphqlListResult<GraphqlExhibition>;
  }>(LIST_HISTORICAL_EXHIBITIONS_QUERY, {
    limit: params.limit,
    nextToken: params.nextToken,
  });

  return data.listAllHistoricalExhibitions ?? { items: [], nextToken: null };
}

export async function fetchHistoricalExhibitionsByGalleryNameAll(
  galleryName: string,
  options: { pageSize?: number; maxPages?: number } = {},
): Promise<GraphqlExhibition[]> {
  const normalizedTarget = galleryName?.trim().toLowerCase();
  if (!normalizedTarget) return [];

  const pageSize = options.pageSize ?? 200;
  const maxPages = options.maxPages ?? 200;

  const matches: GraphqlExhibition[] = [];
  let nextToken: string | null | undefined = null;

  for (let page = 0; page < maxPages; page += 1) {
    const connection = await fetchHistoricalExhibitionsPage({ limit: pageSize, nextToken });
    const items = Array.isArray(connection.items) ? connection.items : [];

    items.forEach((item) => {
      const itemGallery = item?.galleryname?.trim().toLowerCase();
      if (itemGallery && itemGallery === normalizedTarget) {
        matches.push(item);
      }
    });

    nextToken = connection.nextToken ?? null;
    if (!nextToken) break;
  }

  return matches;
}

export async function fetchExhibitionByIdDirect(id: string): Promise<GraphqlExhibition | null> {
  if (!id) return null;

  const data = await executeGraphQL<{ getExhibitionById: GraphqlExhibition | null }>(GET_EXHIBITION_BY_ID_QUERY, {
    id,
  });

  return data.getExhibitionById ?? null;
}

export async function fetchHistoricalExhibitionsByGalleryIdPage(
  params: { galleryId: string; limit?: number; nextToken?: string | null },
): Promise<GraphqlListResult<GraphqlExhibition>> {
  const data = await executeGraphQL<{
    listHistoricalExhibitionsByGalleryId: GraphqlListResult<GraphqlExhibition>;
  }>(LIST_HISTORICAL_EXHIBITIONS_BY_GALLERY_ID_QUERY, {
    galleryId: params.galleryId,
    limit: params.limit,
    nextToken: params.nextToken,
  });

  return data.listHistoricalExhibitionsByGalleryId ?? { items: [], nextToken: null };
}

export async function fetchHistoricalExhibitionsByGalleryIdAll(
  galleryId: string,
  options: { pageSize?: number; maxPages?: number } = {},
): Promise<GraphqlExhibition[]> {
  if (!galleryId) return [];

  const pageSize = options.pageSize ?? 200;
  const maxPages = options.maxPages ?? 100;

  const all: GraphqlExhibition[] = [];
  let nextToken: string | null | undefined = null;

  for (let page = 0; page < maxPages; page += 1) {
    const connection = await fetchHistoricalExhibitionsByGalleryIdPage({
      galleryId,
      limit: pageSize,
      nextToken,
    });

    const items = Array.isArray(connection.items) ? connection.items : [];
    all.push(...items);

    nextToken = connection.nextToken ?? null;
    if (!nextToken) break;
  }

  return all;
}

export async function fetchExhibitionById(id: string): Promise<GraphqlExhibition | null> {
  if (!id) return null;

  let nextToken: string | null | undefined = null;
  // Safety guard to avoid infinite loops if API misbehaves.
  for (let page = 0; page < 200; page += 1) {
    const connection = await fetchExhibitionsPage({ limit: 200, nextToken });
    const items = Array.isArray(connection.items) ? connection.items : [];
    const found = items.find((item) => item?.id === id) ?? null;
    if (found) return found;

    nextToken = connection.nextToken ?? null;
    if (!nextToken) break;
  }

  return null;
}

export async function fetchHistoricalExhibitionById(id: string): Promise<GraphqlExhibition | null> {
  if (!id) return null;

  let nextToken: string | null | undefined = null;
  // Safety guard to avoid infinite loops if API misbehaves.
  for (let page = 0; page < 400; page += 1) {
    const connection = await fetchHistoricalExhibitionsPage({ limit: 200, nextToken });
    const items = Array.isArray(connection.items) ? connection.items : [];
    const found = items.find((item) => item?.id === id) ?? null;
    if (found) return found;

    nextToken = connection.nextToken ?? null;
    if (!nextToken) break;
  }

  return null;
}

export async function fetchGalleryById(id: string): Promise<GraphqlGallery | null> {
  const data = await executeGraphQL<{ getGalleryById: GraphqlGallery | null }>(GET_GALLERY_QUERY, { id });
  return data.getGalleryById ? enrichGallery(data.getGalleryById) : null;
}

export async function fetchExhibitionsByGallery(
  galleryId: string,
  limit = 12
): Promise<GraphqlExhibition[]> {
  const data = await executeGraphQL<{
    listExhibitionsByGalleryId: GraphqlListResult<GraphqlExhibition>;
  }>(LIST_EXHIBITIONS_BY_GALLERY_QUERY, {
    galleryId,
    limit,
  });

  return data.listExhibitionsByGalleryId?.items ?? [];
}

export async function fetchExhibitionsByGalleryPage(
  params: { galleryId: string; limit?: number; nextToken?: string | null },
): Promise<GraphqlListResult<GraphqlExhibition>> {
  const data = await executeGraphQL<{
    listExhibitionsByGalleryId: GraphqlListResult<GraphqlExhibition>;
  }>(LIST_EXHIBITIONS_BY_GALLERY_QUERY, {
    galleryId: params.galleryId,
    limit: params.limit,
    nextToken: params.nextToken,
  });

  return data.listExhibitionsByGalleryId ?? { items: [], nextToken: null };
}

export async function fetchExhibitionsByGalleryAll(
  galleryId: string,
  options: { pageSize?: number; maxPages?: number } = {},
): Promise<GraphqlExhibition[]> {
  if (!galleryId) return [];

  const pageSize = options.pageSize ?? 200;
  const maxPages = options.maxPages ?? 50;

  const all: GraphqlExhibition[] = [];
  let nextToken: string | null | undefined = null;

  for (let page = 0; page < maxPages; page += 1) {
    const connection = await fetchExhibitionsByGalleryPage({
      galleryId,
      limit: pageSize,
      nextToken,
    });

    const items = Array.isArray(connection.items) ? connection.items : [];
    all.push(...items);

    nextToken = connection.nextToken ?? null;
    if (!nextToken) break;
  }

  return all;
}

// ============ ARTISTS ============

export interface GraphqlArtist {
  id: string;
  name: string;
  description?: string | null;
  birth_year?: number | null;
  death_year?: number | null;
  country?: string | null;
  wikipedia_url?: string | null;
}

const LIST_ARTISTS_QUERY = `#graphql
  query ListAllArtists($limit: Int, $nextToken: String) {
    listAllArtists(limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        birth_year
        death_year
        country
        wikipedia_url
      }
      nextToken
    }
  }
`;

const GET_ARTIST_QUERY = `#graphql
  query GetArtist($id: ID!) {
    getArtist(id: $id) {
      id
      name
      description
      birth_year
      death_year
      country
      wikipedia_url
    }
  }
`;

const EXHIBITIONS_FOR_ARTIST_QUERY = `#graphql
  query ExhibitionsForArtist($artistId: ID!) {
    exhibitionsForArtist(artistId: $artistId) {
      items {
        id
        title
        galleryname
        gallery_id
        city
        description
        datefrom
        dateto
        datefrom_epoch
        dateto_epoch
        exhibition_img_url
      }
    }
  }
`;

// ============ ARTISTS CACHE ============
// Load all artists once and cache for instant filtering/pagination

let artistsCache: GraphqlArtist[] | null = null;
let artistsCachePromise: Promise<GraphqlArtist[]> | null = null;
const ARTIST_PAGE_SIZE = 250;

/**
 * Load ALL artists into cache. Called once, then reused.
 */
async function loadAllArtists(): Promise<GraphqlArtist[]> {
  if (artistsCache) {
    return artistsCache;
  }
  
  if (artistsCachePromise) {
    return artistsCachePromise;
  }
  
  artistsCachePromise = (async () => {
    const allArtists: GraphqlArtist[] = [];
    let nextToken: string | null = null;
    
    do {
      const data = await executeGraphQL<{ listAllArtists: GraphqlListResult<GraphqlArtist> }>(
        LIST_ARTISTS_QUERY,
        { limit: ARTIST_PAGE_SIZE, nextToken }
      );
      
      const items = data.listAllArtists?.items ?? [];
      allArtists.push(...items);
      nextToken = data.listAllArtists?.nextToken ?? null;
    } while (nextToken);
    
    artistsCache = allArtists;
    console.log(`✅ Loaded ${allArtists.length} artists into cache`);
    return allArtists;
  })();
  
  return artistsCachePromise;
}

export function warmArtistsCache(): Promise<GraphqlArtist[]> {
  return loadAllArtists();
}

export interface FetchArtistsParams {
  limit?: number;
  offset?: number;
  countryCode?: string;
  countryFilter?: string[];
}

/**
 * Get artists from cache with pagination and optional country filter.
 * First call loads all artists, subsequent calls are instant.
 */
export async function fetchArtistsCached(
  params: FetchArtistsParams = {}
): Promise<{ items: GraphqlArtist[]; hasMore: boolean; total: number }> {
  const allArtists = await loadAllArtists();
  
  let filtered = allArtists;
  
  const normalizedCode = params.countryCode?.toUpperCase();

  if (normalizedCode) {
    filtered = filtered.filter((artist) => {
      const normalized = normalizeCountry(artist.country ?? undefined);
      return normalized?.code === normalizedCode;
    });
  } else if (params.countryFilter && params.countryFilter.length > 0) {
    const countrySet = new Set(params.countryFilter.map((c) => c.toLowerCase()));
    filtered = filtered.filter(
      (artist) => artist.country && countrySet.has(artist.country.toLowerCase())
    );
  }
  
  const offset = params.offset ?? 0;
  const limit = params.limit ?? 20;
  const items = filtered.slice(offset, offset + limit);
  const hasMore = offset + limit < filtered.length;
  
  return { items, hasMore, total: filtered.length };
}

/**
 * Count artists by country - instant from cache.
 */
export async function countArtistsByCountryCached(countryAliases: string[]): Promise<number> {
  if (!countryAliases.length) {
    return 0;
  }
  
  const allArtists = await loadAllArtists();
  const countrySet = new Set(countryAliases.map(c => c.toLowerCase()));
  
  return allArtists.filter(artist => 
    artist.country && countrySet.has(artist.country.toLowerCase())
  ).length;
}

// Legacy functions for backwards compatibility
export interface FetchArtistsParamsLegacy {
  limit?: number;
  nextToken?: string | null;
  countryFilter?: string[];
}

export async function fetchArtists(
  params: FetchArtistsParamsLegacy = {}
): Promise<GraphqlListResult<GraphqlArtist>> {
  const data = await executeGraphQL<{ listAllArtists: GraphqlListResult<GraphqlArtist> }>(
    LIST_ARTISTS_QUERY,
    { limit: params.limit, nextToken: params.nextToken }
  );

  let items = data.listAllArtists?.items ?? [];
  
  // Filter by country client-side (API doesn't support filter param for artists)
  if (params.countryFilter && params.countryFilter.length > 0) {
    const countrySet = new Set(params.countryFilter.map(c => c.toLowerCase()));
    items = items.filter(artist => 
      artist.country && countrySet.has(artist.country.toLowerCase())
    );
  }

  return {
    items,
    nextToken: data.listAllArtists?.nextToken ?? null,
  };
}

/**
 * Count artists by country - uses cache for instant results.
 */
export async function countArtistsByCountry(countryAliases: string[]): Promise<number> {
  return countArtistsByCountryCached(countryAliases);
}

export async function fetchArtistById(id: string): Promise<GraphqlArtist | null> {
  const data = await executeGraphQL<{ getArtist: GraphqlArtist | null }>(GET_ARTIST_QUERY, { id });
  return data.getArtist ?? null;
}

export async function fetchExhibitionsForArtist(
  artistId: string
): Promise<GraphqlExhibition[]> {
  try {
    const data = await executeGraphQL<{
      exhibitionsForArtist: { items: (GraphqlExhibition | null)[] };
    }>(EXHIBITIONS_FOR_ARTIST_QUERY, { artistId });

    // Filter out null items (API sometimes returns null for exhibitions with missing data)
    return (data.exhibitionsForArtist?.items ?? []).filter(
      (item): item is GraphqlExhibition => item !== null && item.id !== null
    );
  } catch (err) {
    // API can return errors for exhibitions with null IDs - gracefully return empty
    console.warn('Failed to fetch exhibitions for artist:', artistId, err);
    return [];
  }
}

// ============ SEARCH FUNCTIONS ============

export async function searchArtists(
  query: string,
  limit = 50
): Promise<GraphqlArtist[]> {
  if (!query.trim()) {
    return [];
  }

  const searchLower = query.toLowerCase();
  const results: GraphqlArtist[] = [];
  let nextToken: string | null = null;
  let iterations = 0;
  const MAX_ITERATIONS = 100; // Safety limit - covers 10,000 artists at 100/page

  // Iterate through pages until we find enough results or exhaust all data
  do {
    iterations++;
    const data = await executeGraphQL<{ listAllArtists: GraphqlListResult<GraphqlArtist> }>(
      LIST_ARTISTS_QUERY,
      { limit: 100, nextToken }
    );

    const connection = data.listAllArtists ?? { items: [], nextToken: null };
    const items = connection.items ?? [];
    
    // Filter matching artists
    const matching = items.filter(
      (artist) =>
        artist.name?.toLowerCase().includes(searchLower) ||
        artist.country?.toLowerCase().includes(searchLower) ||
        artist.description?.toLowerCase().includes(searchLower)
    );
    
    results.push(...matching);
    nextToken = connection.nextToken ?? null;

    // Stop early if we have enough results
    if (results.length >= limit) {
      break;
    }
  } while (nextToken && iterations < MAX_ITERATIONS);

  return results.slice(0, limit);
}

export async function searchExhibitions(
  query: string,
  limit = 50
): Promise<GraphqlExhibition[]> {
  if (!query.trim()) {
    return [];
  }

  const searchLower = query.toLowerCase();
  const results: GraphqlExhibition[] = [];
  let nextToken: string | null | undefined = null;

  const PAGE_SIZE = 100;
  const MAX_PAGES = 200; // Safety limit

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const connection = await fetchExhibitionsPage({ limit: PAGE_SIZE, nextToken });
    const items = Array.isArray(connection.items) ? connection.items : [];

    const matching = items.filter(
      (exhibition) =>
        exhibition.title?.toLowerCase().includes(searchLower) ||
        exhibition.galleryname?.toLowerCase().includes(searchLower) ||
        exhibition.city?.toLowerCase().includes(searchLower) ||
        exhibition.artist?.toLowerCase().includes(searchLower) ||
        exhibition.description?.toLowerCase().includes(searchLower)
    );

    results.push(...matching);
    if (results.length >= limit) {
      break;
    }

    nextToken = connection.nextToken ?? null;
    if (!nextToken) {
      break;
    }
  }

  return results.slice(0, limit);
}
