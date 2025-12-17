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

const sanitizeProxyBase = (value?: string) => {
  if (!value) {
    return '/api/sanity'
  }

  return value.endsWith('/') ? value.slice(0, -1) : value
}

const isLocalHostname = (hostname: string) => {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  )
}

const shouldProxySanityRequests = () => {
  if (typeof window === 'undefined') {
    return false
  }

  return isLocalHostname(window.location.hostname)
}

const getNativeFetch = () => {
  return typeof fetch === 'function' ? fetch.bind(globalThis) : undefined
}

const createSanityProxyFetch = (nativeFetch: typeof fetch, proxyBase: string) => {
  const projectApiHost = `https://${projectId}.api.sanity.io`
  const projectCdnHost = `https://${projectId}.apicdn.sanity.io`
  const proxyHosts = [projectApiHost, projectCdnHost]

  return (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    if (typeof Request === 'undefined') {
      return nativeFetch(input as RequestInfo, init)
    }

    const originalRequest = new Request(input as RequestInfo | URL, init)
    const matchedHost = proxyHosts.find((host) => originalRequest.url.startsWith(host))

    if (!matchedHost) {
      return nativeFetch(originalRequest as RequestInfo, init)
    }

    const proxiedUrl = `${proxyBase}${originalRequest.url.slice(matchedHost.length)}`
    const proxiedRequest = new Request(proxiedUrl, originalRequest)

    return nativeFetch(proxiedRequest)
  }
}

const sanityProxyBase = sanitizeProxyBase(getViteEnv('VITE_SANITY_PROXY_PATH') || getProcessEnv('SANITY_PROXY_PATH'))
const nativeFetch = getNativeFetch()
const sanityProxyFetch = nativeFetch && shouldProxySanityRequests() ? createSanityProxyFetch(nativeFetch, sanityProxyBase) : undefined

if (typeof window !== 'undefined' && typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) {
  // Surface whether the proxy is active during local development to ease CORS debugging
  console.info('🛰️ Sanity proxy', sanityProxyFetch ? 'enabled' : 'disabled', {
    hostname: window.location.hostname,
    proxyBase: sanityProxyBase,
  })
}

const clientConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn,
  perspective: 'published' as const,
}

if (sanityProxyFetch) {
  Object.assign(clientConfig, {fetch: sanityProxyFetch})
}

export const client = createClient(clientConfig)

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  studioUrl,
  useCdn,
}