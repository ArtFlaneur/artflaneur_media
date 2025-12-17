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
  country?: string | null;
  city?: string | null;
  fulladdress?: string | null;
  gallery_img_url?: string | null;
  logo_img_url?: string | null;
  lat?: number | string | null;
  lon?: number | string | null;
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
        city
        fulladdress
        lat
        lon
        placeurl
        openinghours
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
        city
        fulladdress
        lat
        lon
        distanceInKm
        placeurl
        openinghours
        gallery_img_url
      }
      nextToken
    }
  }
`;

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

export interface FetchGalleriesParams {
  limit?: number;
  nextToken?: string | null;
  filter?: GalleryFilterInput;
}

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

  return data.listGalleriesById ?? { items: [], nextToken: null };
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
    nearbyGalleriesById: GraphqlListResult<GraphqlGallery & { distanceInKm?: number | null }>;
  }>(NEARBY_GALLERIES_QUERY, {
    latitude: params.latitude,
    longitude: params.longitude,
    radiusInKm: params.radiusInKm,
    limit: params.limit,
  });

  return data.nearbyGalleriesById?.items ?? [];
}

export async function fetchExhibitions(limit = 50): Promise<GraphqlExhibition[]> {
  const data = await executeGraphQL<{ listAllExhibitions: GraphqlListResult<GraphqlExhibition> }>(
    LIST_EXHIBITIONS_QUERY,
    { limit }
  );
  return data.listAllExhibitions?.items ?? [];
}
