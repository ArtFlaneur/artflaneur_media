const SECURE_HOST_PATTERN = /assets\.artflaneur\.com\.au/i;
const TOKEN_REFRESH_BUFFER_MS = 30_000;
const DEFAULT_TOKEN_TTL_MS = 4 * 60 * 1000;
const MAX_CONCURRENT_REQUESTS = 6;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// In development, use Vite proxy to bypass CORS
const IS_DEV = import.meta.env.DEV;
const TOKEN_ENDPOINT = IS_DEV
  ? '/api/token'
  : 'https://hgito8qnb0.execute-api.ap-southeast-2.amazonaws.com/dev/token';
const ASSETS_BASE = IS_DEV ? '/api/assets' : 'https://assets.artflaneur.com.au';
const SECURE_IMAGE_PROXY_ENDPOINT = '/api/secure-image';

let cachedToken: { value: string; expiresAt: number } | null = null;
let ongoingTokenRequest: Promise<string> | null = null;
const imageCache = new Map<string, string>();
const pendingRequests = new Map<string, Promise<string>>();

// Throttle concurrent requests
let activeRequests = 0;
const requestQueue: Array<() => void> = [];

const decodeTokenExpiry = (token: string): number | null => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    if (typeof atob !== 'function') return null;
    const decoded = atob(normalized);
    const data = JSON.parse(decoded);
    if (typeof data.exp === 'number') {
      return data.exp * 1000;
    }
    return null;
  } catch (error) {
    console.warn('Unable to decode JWT expiry, falling back to default TTL.', error);
    return null;
  }
};

const requestNewToken = async (): Promise<string> => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image access token (${response.status}).`);
  }

  const payload = (await response.json()) as { accessToken?: string };
  if (!payload.accessToken) {
    throw new Error('Token endpoint returned an empty response.');
  }

  const expiresAt = decodeTokenExpiry(payload.accessToken) ?? Date.now() + DEFAULT_TOKEN_TTL_MS;
  cachedToken = { value: payload.accessToken, expiresAt };
  return payload.accessToken;
};

const getValidToken = async (): Promise<string> => {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - TOKEN_REFRESH_BUFFER_MS > now) {
    return cachedToken.value;
  }

  if (!ongoingTokenRequest) {
    ongoingTokenRequest = requestNewToken().finally(() => {
      ongoingTokenRequest = null;
    });
  }

  return ongoingTokenRequest;
};

const rewriteUrlForProxy = (src: string): string => {
  if (IS_DEV && SECURE_HOST_PATTERN.test(src)) {
    return src.replace(/https?:\/\/assets\.artflaneur\.com\.au/i, ASSETS_BASE);
  }
  return src;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const waitForSlot = (): Promise<void> => {
  return new Promise((resolve) => {
    if (activeRequests < MAX_CONCURRENT_REQUESTS) {
      activeRequests++;
      resolve();
    } else {
      requestQueue.push(() => {
        activeRequests++;
        resolve();
      });
    }
  });
};

const releaseSlot = () => {
  activeRequests--;
  const next = requestQueue.shift();
  if (next) next();
};

const fetchSecureBlob = async (src: string, allowRetry = true): Promise<Blob> => {
  if (!IS_DEV) {
    const proxyUrl = `${SECURE_IMAGE_PROXY_ENDPOINT}?src=${encodeURIComponent(src)}`;
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`Failed to load secure image via proxy (${response.status}).`);
    }

    return response.blob();
  }

  const token = await getValidToken();
  const proxiedSrc = rewriteUrlForProxy(src);
  const response = await fetch(proxiedSrc, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401 && allowRetry) {
    cachedToken = null;
    return fetchSecureBlob(src, false);
  }

  if (!response.ok) {
    throw new Error(`Failed to load secure image (${response.status}).`);
  }

  return response.blob();
};

const fetchSecureBlobWithRetry = async (src: string, retries = MAX_RETRIES): Promise<Blob> => {
  try {
    await waitForSlot();
    return await fetchSecureBlob(src);
  } catch (error) {
    if (retries > 0 && error instanceof Error && error.message.includes('502')) {
      await sleep(RETRY_DELAY_MS * (MAX_RETRIES - retries + 1));
      return fetchSecureBlobWithRetry(src, retries - 1);
    }
    throw error;
  } finally {
    releaseSlot();
  }
};

export const shouldUseSecureImage = (src?: string | null): src is string => {
  return Boolean(src && SECURE_HOST_PATTERN.test(src));
};

export const resolveSecureImageUrl = async (src: string): Promise<string> => {
  if (!shouldUseSecureImage(src)) {
    return src;
  }

  if (imageCache.has(src)) {
    return imageCache.get(src)!;
  }

  // Deduplicate concurrent requests for the same image
  if (pendingRequests.has(src)) {
    return pendingRequests.get(src)!;
  }

  const promise = (async () => {
    try {
      const blob = await fetchSecureBlobWithRetry(src);
      const objectUrl = URL.createObjectURL(blob);
      imageCache.set(src, objectUrl);
      return objectUrl;
    } finally {
      pendingRequests.delete(src);
    }
  })();

  pendingRequests.set(src, promise);
  return promise;
};

export const clearSecureImageCache = () => {
  imageCache.forEach((url) => URL.revokeObjectURL(url));
  imageCache.clear();
  cachedToken = null;
};
