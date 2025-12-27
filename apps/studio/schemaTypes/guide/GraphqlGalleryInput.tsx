import {useCallback, useMemo, useState} from 'react'
import {SearchIcon, RefreshIcon} from '@sanity/icons'
import {Box, Button, Card, Flex, Spinner, Stack, Text, TextInput} from '@sanity/ui'
import type {ObjectInputProps} from 'sanity'
import {set, unset} from 'sanity'

// Value stored inside the externalGallery object
export type ExternalGalleryValue = {
  _type?: string
  id?: string
  name?: string
  city?: string
  address?: string
  website?: string
  workingHours?: string
}

type GraphqlGalleryHit = {
  id: string
  galleryname: string
  country?: string | null
  fulladdress?: string | null
  placeurl?: string | null
  openinghours?: string | null
}

type GraphqlEnvelope = {
  data?: {
    listGalleriesById?: {
      items?: GraphqlGalleryHit[]
    }
  }
  errors?: Array<{message?: string}>
}

type GetGalleryEnvelope = {
  data?: {
    getGalleryById?: GraphqlGalleryHit | null
  }
  errors?: Array<{message?: string}>
}

const getEnv = (key: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.[key]) {
    return (import.meta as any).env[key]
  }

  if (typeof process !== 'undefined' && (process.env as Record<string, string | undefined>)[key]) {
    return process.env[key]
  }

  return undefined
}

const GRAPHQL_ENDPOINT =
  getEnv('SANITY_STUDIO_GRAPHQL_ENDPOINT') ||
  getEnv('VITE_GRAPHQL_ENDPOINT') ||
  getEnv('GRAPHQL_ENDPOINT')

const GRAPHQL_API_KEY =
  getEnv('SANITY_STUDIO_GRAPHQL_API_KEY') ||
  getEnv('VITE_GRAPHQL_API_KEY') ||
  getEnv('GRAPHQL_API_KEY')

const GRAPHQL_TENANT_ID =
  getEnv('SANITY_STUDIO_GRAPHQL_TENANT_ID') ||
  getEnv('VITE_GRAPHQL_TENANT_ID') ||
  getEnv('GRAPHQL_TENANT_ID') ||
  'artflaneur'

const SEARCH_GALLERIES_QUERY = `query SearchGuideGalleries($limit: Int!, $filter: GalleryFilterInput) {
  listGalleriesById(limit: $limit, filter: $filter) {
    items {
      id
      galleryname
      country
      fulladdress
      placeurl
    }
  }
}`

const GET_GALLERY_QUERY = `query GetGuideGalleryById($id: ID!) {
  getGalleryById(id: $id) {
    id
    galleryname
    city
    fulladdress
    placeurl
    openinghours
  }
}`

const deriveCity = (gallery: GraphqlGalleryHit): string | undefined => {
  const segments = gallery.fulladdress?.split(',').map((segment) => segment.trim()).filter(Boolean) ?? []
  if (!segments.length) return undefined

  if (gallery.country) {
    const withoutCountry = segments.filter((segment) => segment.toLowerCase() !== gallery.country?.toLowerCase())
    if (withoutCountry.length) {
      return withoutCountry[withoutCountry.length - 1]
    }
  }

  return segments[segments.length - 2] ?? segments[segments.length - 1]
}

const fetchGraphqlGalleries = async (term: string): Promise<GraphqlGalleryHit[]> => {
  if (!GRAPHQL_ENDPOINT || !GRAPHQL_API_KEY) {
    throw new Error('Configure SANITY_STUDIO_GRAPHQL_ENDPOINT and SANITY_STUDIO_GRAPHQL_API_KEY in apps/studio/.env')
  }

  const trimmed = term.trim()
  if (!trimmed) {
    return []
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': GRAPHQL_API_KEY,
      'x-tenant-id': GRAPHQL_TENANT_ID,
    },
    body: JSON.stringify({
      query: SEARCH_GALLERIES_QUERY,
      variables: {
        limit: 25,
        filter: {
          or: [
            {galleryname: {contains: trimmed}},
            {country: {contains: trimmed}},
            {fulladdress: {contains: trimmed}},
          ],
        },
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`GraphQL request failed (${response.status}): ${errorText}`)
  }

  const payload = (await response.json()) as GraphqlEnvelope
  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message || 'GraphQL returned an error')
  }

  return payload.data?.listGalleriesById?.items ?? []
}

const fetchGalleryDetails = async (galleryId: string): Promise<GraphqlGalleryHit | null> => {
  if (!GRAPHQL_ENDPOINT || !GRAPHQL_API_KEY) {
    return null
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': GRAPHQL_API_KEY,
      'x-tenant-id': GRAPHQL_TENANT_ID,
    },
    body: JSON.stringify({
      query: GET_GALLERY_QUERY,
      variables: {id: galleryId},
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Failed to fetch gallery details', galleryId, errorText)
    return null
  }

  const payload = (await response.json()) as GetGalleryEnvelope
  if (payload.errors?.length) {
    console.error('GraphQL returned an error while fetching gallery details', payload.errors)
    return null
  }

  return payload.data?.getGalleryById ?? null
}

const GraphqlGalleryInput = (props: ObjectInputProps<ExternalGalleryValue>) => {
  const {value, onChange, schemaType, elementProps, readOnly} = props
  const [query, setQuery] = useState(value?.name ?? '')
  const [results, setResults] = useState<GraphqlGalleryHit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isConfigured = useMemo(() => Boolean(GRAPHQL_ENDPOINT && GRAPHQL_API_KEY), [])
  const isSearchingDisabled = !isConfigured || readOnly

  const handleSearch = useCallback(async () => {
    if (isSearchingDisabled) return

    try {
      setLoading(true)
      setError(null)
      const hits = await fetchGraphqlGalleries(query)
      setResults(hits)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search galleries')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [isSearchingDisabled, query])

  const handleSelect = useCallback(
    async (gallery: GraphqlGalleryHit) => {
      if (readOnly) return

      let workingHours: string | undefined
      try {
        const details = await fetchGalleryDetails(gallery.id)
        workingHours = details?.openinghours ?? gallery.openinghours ?? undefined
      } catch (err) {
        console.error('Failed to load gallery details for working hours', gallery.id, err)
        workingHours = gallery.openinghours ?? undefined
      }

      onChange(
        set({
          _type: schemaType.name,
          id: gallery.id,
          name: gallery.galleryname,
          city: deriveCity(gallery),
          address: gallery.fulladdress ?? undefined,
          website: gallery.placeurl ?? undefined,
          workingHours,
        }),
      )
      setResults([])
      setQuery(gallery.galleryname)
    },
    [onChange, readOnly, schemaType.name],
  )

  const handleClear = useCallback(() => {
    if (readOnly) return

    onChange(unset())
    setResults([])
    setQuery('')
  }, [onChange, readOnly])

  return (
    <Stack space={3}>
      <Text size={1} weight="semibold">
        {schemaType.title}
      </Text>

      {!isConfigured && (
        <Card padding={3} tone="caution" radius={2} border>
          <Text size={1} muted>
            Добавьте SANITY_STUDIO_GRAPHQL_ENDPOINT и SANITY_STUDIO_GRAPHQL_API_KEY в apps/studio/.env, чтобы искать галереи в каталоге.
          </Text>
        </Card>
      )}

      {value?.id ? (
        <Card padding={3} radius={2} shadow={1} border>
          <Stack space={2}>
            <Flex align="center" justify="space-between">
              <Stack space={1}>
                <Text size={2} weight="bold">
                  {value.name ?? 'Выбранная галерея'}
                </Text>
                <Text size={1} muted>
                  GraphQL ID: {value.id}
                </Text>
              </Stack>
              <Button
                icon={RefreshIcon}
                mode="ghost"
                text="Очистить"
                onClick={handleClear}
                disabled={readOnly}
              />
            </Flex>
            <Text size={1}>{value.address ?? 'Адрес не указан'}</Text>
            {value.city && (
              <Text size={1} muted>
                {value.city}
              </Text>
            )}
            {value.website && (
              <Text size={1} weight="semibold">
                {value.website}
              </Text>
            )}
            {value.workingHours && (
              <Text size={1} muted>
                {value.workingHours.split(/\r?\n/)[0]}
              </Text>
            )}
          </Stack>
        </Card>
      ) : (
        <Text size={1} muted>
          Свяжите пункт с существующей записью Sanity или найдите её в GraphQL каталоге ниже.
        </Text>
      )}

      <Flex gap={2}>
        <Box flex={1}>
          <TextInput
            {...elementProps}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Поиск по названию, городу или адресу"
            disabled={isSearchingDisabled}
          />
        </Box>
        <Button
          icon={SearchIcon}
          text="Найти"
          tone="primary"
          mode="default"
          disabled={isSearchingDisabled || !query.trim()}
          onClick={handleSearch}
        />
      </Flex>

      {loading && (
        <Flex align="center" gap={2}>
          <Spinner />
          <Text size={1}>Загружаем результаты…</Text>
        </Flex>
      )}

      {error && (
        <Card padding={3} tone="critical" radius={2} border>
          <Text size={1}>{error}</Text>
        </Card>
      )}

      {!loading && results.length > 0 && (
        <Stack space={2}>
          {results.map((gallery) => (
            <Card
              key={gallery.id}
              as="button"
              padding={3}
              radius={2}
              shadow={1}
              border
              onClick={() => {
                void handleSelect(gallery)
              }}
              disabled={readOnly}
            >
              <Stack space={1}>
                <Text size={2} weight="semibold">
                  {gallery.galleryname}
                </Text>
                <Text size={1} muted>
                  {[deriveCity(gallery), gallery.country].filter(Boolean).join(', ') || 'Локация не указана'}
                </Text>
                <Text size={1}>{gallery.fulladdress ?? 'Адрес не указан'}</Text>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  )
}

export default GraphqlGalleryInput
