const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT;
const GRAPHQL_API_KEY = import.meta.env.VITE_GRAPHQL_API_KEY;
const GRAPHQL_TENANT_ID = import.meta.env.VITE_GRAPHQL_TENANT_ID || 'artflaneur';

if (!GRAPHQL_ENDPOINT || !GRAPHQL_API_KEY) {
  console.warn(
    '⚠️ GraphQL API is not fully configured. Set VITE_GRAPHQL_ENDPOINT and VITE_GRAPHQL_API_KEY to enable API access.'
  );
}

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
  exhibition_type?: string[] | null;
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

const NEARBY_GALLERIES_QUERY = `#graphql
  query NearbyGalleries($latitude: Float!, $longitude: Float!, $radiusInKm: Float!, $limit: Int) {
    nearbyGalleriesById(latitude: $latitude, longitude: $longitude, radiusInKm: $radiusInKm, limit: $limit) {
      items {
        id
        galleryname
        country
        fulladdress
        lat
        lon
        distanceInKm
        placeurl
        openinghours
        specialevent
        eventtype
        allowed
        gallery_img_url
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
      { country: { contains: query } },
      { fulladdress: { contains: query } },
    ],
  };

  const result = await fetchGalleries({ limit, filter });
  return result.items ?? [];
}

export interface NearbyGalleriesParams {
  latitude: number;
  longitude: number;
  radiusInKm: number;
  limit?: number;
}

export async function fetchNearbyGalleries(
  params: NearbyGalleriesParams
): Promise<GraphqlGallery[]> {
  const data = await executeGraphQL<{
    nearbyGalleriesById: GraphqlListResult<GraphqlGallery>;
  }>(NEARBY_GALLERIES_QUERY, {
    latitude: params.latitude,
    longitude: params.longitude,
    radiusInKm: params.radiusInKm,
    limit: params.limit,
  });

  return (data.nearbyGalleriesById?.items ?? []).map(enrichGallery);
}

export async function fetchExhibitions(limit = 50): Promise<GraphqlExhibition[]> {
  const data = await executeGraphQL<{ listAllExhibitions: GraphqlListResult<GraphqlExhibition> }>(
    LIST_EXHIBITIONS_QUERY,
    { limit }
  );
  return data.listAllExhibitions?.items ?? [];
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

export interface FetchArtistsParams {
  limit?: number;
  nextToken?: string | null;
}

export async function fetchArtists(
  params: FetchArtistsParams = {}
): Promise<GraphqlListResult<GraphqlArtist>> {
  const data = await executeGraphQL<{ listAllArtists: GraphqlListResult<GraphqlArtist> }>(
    LIST_ARTISTS_QUERY,
    { limit: params.limit, nextToken: params.nextToken }
  );

  return data.listAllArtists ?? { items: [], nextToken: null };
}

export async function fetchArtistById(id: string): Promise<GraphqlArtist | null> {
  const data = await executeGraphQL<{ getArtist: GraphqlArtist | null }>(GET_ARTIST_QUERY, { id });
  return data.getArtist ?? null;
}

export async function fetchExhibitionsForArtist(
  artistId: string
): Promise<GraphqlExhibition[]> {
  const data = await executeGraphQL<{
    exhibitionsForArtist: { items: GraphqlExhibition[] };
  }>(EXHIBITIONS_FOR_ARTIST_QUERY, { artistId });

  return data.exhibitionsForArtist?.items ?? [];
}

// ============ SEARCH FUNCTIONS ============

export async function searchArtists(
  query: string,
  limit = 50
): Promise<GraphqlArtist[]> {
  if (!query.trim()) {
    return [];
  }

  // Fetch all artists and filter client-side since API doesn't support text search
  const result = await fetchArtists({ limit: 500 });
  const searchLower = query.toLowerCase();
  
  return (result.items ?? []).filter(
    (artist) =>
      artist.name?.toLowerCase().includes(searchLower) ||
      artist.country?.toLowerCase().includes(searchLower) ||
      artist.description?.toLowerCase().includes(searchLower)
  ).slice(0, limit);
}

export async function searchExhibitions(
  query: string,
  limit = 50
): Promise<GraphqlExhibition[]> {
  if (!query.trim()) {
    return [];
  }

  // Fetch exhibitions and filter client-side
  const exhibitions = await fetchExhibitions(500);
  const searchLower = query.toLowerCase();
  
  return exhibitions.filter(
    (exhibition) =>
      exhibition.title?.toLowerCase().includes(searchLower) ||
      exhibition.galleryname?.toLowerCase().includes(searchLower) ||
      exhibition.city?.toLowerCase().includes(searchLower) ||
      exhibition.artist?.toLowerCase().includes(searchLower) ||
      exhibition.description?.toLowerCase().includes(searchLower)
  ).slice(0, limit);
}
