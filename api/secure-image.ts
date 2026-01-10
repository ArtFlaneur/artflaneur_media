export const config = {
  runtime: 'edge',
};

const SECURE_HOST_PATTERN = /^https:\/\/assets\.artflaneur\.com\.au/i;
const DEFAULT_TOKEN_ENDPOINT = 'https://hgito8qnb0.execute-api.ap-southeast-2.amazonaws.com/dev/token';
const TOKEN_ENDPOINT = process.env.SECURE_ASSET_TOKEN_ENDPOINT ?? DEFAULT_TOKEN_ENDPOINT;
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const errorResponse = (message: string, status = 500) =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });

const fetchAccessToken = async () => {
  if (!TOKEN_ENDPOINT) {
    throw new Error('Secure asset token endpoint is not configured.');
  }

  const response = await fetch(TOKEN_ENDPOINT, { method: 'GET' });

  if (!response.ok) {
    throw new Error(`Token request failed (${response.status}).`);
  }

  const payload = (await response.json()) as { accessToken?: string };

  if (!payload.accessToken) {
    throw new Error('Token response does not contain an accessToken field.');
  }

  return payload.accessToken;
};

const fetchSecureAsset = async (src: string, token: string) => {
  return fetch(src, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  const { searchParams } = new URL(request.url);
  const src = searchParams.get('src');

  if (!src) {
    return errorResponse('Missing src query parameter.', 400);
  }

  if (!SECURE_HOST_PATTERN.test(src)) {
    return errorResponse('Only assets.artflaneur.com.au URLs are supported.', 400);
  }

  try {
    let token = await fetchAccessToken();
    let upstreamResponse = await fetchSecureAsset(src, token);

    if (upstreamResponse.status === 401) {
      token = await fetchAccessToken();
      upstreamResponse = await fetchSecureAsset(src, token);
    }

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      return errorResponse(`Failed to retrieve asset (${upstreamResponse.status}).`, upstreamResponse.status);
    }

    const headers = new Headers(CORS_HEADERS);
    headers.set('Content-Type', upstreamResponse.headers.get('content-type') ?? 'application/octet-stream');
    headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=900');

    const contentLength = upstreamResponse.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    const etag = upstreamResponse.headers.get('etag');
    if (etag) {
      headers.set('ETag', etag);
    }

    return new Response(upstreamResponse.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Secure image proxy error:', error);
    return errorResponse('Secure image proxy failed.', 502);
  }
}
