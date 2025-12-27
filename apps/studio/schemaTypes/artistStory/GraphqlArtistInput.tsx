/// <reference types="vite/client" />

import React, {useCallback, useMemo, useState} from 'react'
import {Button, Card, Flex, Spinner, Stack, Text, TextInput} from '@sanity/ui'
import {SearchIcon, RefreshIcon} from '@sanity/icons'
import type {ObjectInputProps} from 'sanity'
import {set, unset} from 'sanity'

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

type GraphqlArtist = {
  id: string
  name?: string | null
  description?: string | null
  birth_year?: number | null
  death_year?: number | null
  country?: string | null
  wikipedia_url?: string | null
}

type ListArtistsResponse = {
  data?: {
    listAllArtists?: {
      items?: GraphqlArtist[]
      nextToken?: string | null
    }
  }
  errors?: Array<{message?: string}>
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
`

const MAX_RESULTS = 25
const PAGE_SIZE = 100
const MAX_PAGES = 20

const normalize = (value: string | null | undefined) => value?.toLowerCase().trim() ?? ''

const searchArtists = async (term: string): Promise<GraphqlArtist[]> => {
  if (!GRAPHQL_ENDPOINT || !GRAPHQL_API_KEY) {
    throw new Error('Configure SANITY_STUDIO_GRAPHQL_ENDPOINT and SANITY_STUDIO_GRAPHQL_API_KEY in apps/studio/.env')
  }

  const trimmed = term.trim()
  if (!trimmed) {
    return []
  }

  const matches: GraphqlArtist[] = []
  let nextToken: string | null | undefined = null

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': GRAPHQL_API_KEY,
        'x-tenant-id': GRAPHQL_TENANT_ID,
      },
      body: JSON.stringify({
        query: LIST_ARTISTS_QUERY,
        variables: {
          limit: PAGE_SIZE,
          nextToken,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`GraphQL request failed (${response.status}): ${errorText}`)
    }

    const payload = (await response.json()) as ListArtistsResponse

    if (payload.errors?.length) {
      throw new Error(payload.errors[0]?.message || 'GraphQL returned an error while loading artists')
    }

    const items = payload.data?.listAllArtists?.items ?? []
    const loweredTerm = trimmed.toLowerCase()

    items.forEach((artist) => {
      const name = normalize(artist.name)
      const country = normalize(artist.country)
      const description = normalize(artist.description)

      if (
        name.includes(loweredTerm) ||
        country.includes(loweredTerm) ||
        description.includes(loweredTerm)
      ) {
        matches.push(artist)
      }
    })

    if (matches.length >= MAX_RESULTS) {
      break
    }

    nextToken = payload.data?.listAllArtists?.nextToken ?? null
    if (!nextToken) {
      break
    }
  }

  return matches.slice(0, MAX_RESULTS)
}

const GraphqlArtistInput = (props: ObjectInputProps) => {
  const {value, onChange, readOnly, schemaType} = props
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GraphqlArtist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isConfigured = useMemo(() => Boolean(GRAPHQL_ENDPOINT && GRAPHQL_API_KEY), [])
  const selectedArtist = value as {
    id?: string
    name?: string
    country?: string
    description?: string
    birthYear?: number
    deathYear?: number
    wikipediaUrl?: string
  } | null

  const handleSearch = useCallback(async () => {
    if (!isConfigured || readOnly || !query.trim()) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      const artists = await searchArtists(query)
      setResults(artists)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to search artists right now')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [isConfigured, query, readOnly])

  const handleSelect = useCallback(
    (artist: GraphqlArtist) => {
      if (readOnly) return

      onChange(
        set({
          _type: schemaType.name,
          id: artist.id,
          name: artist.name ?? undefined,
          country: artist.country ?? undefined,
          description: artist.description ?? undefined,
          birthYear: artist.birth_year ?? undefined,
          deathYear: artist.death_year ?? undefined,
          wikipediaUrl: artist.wikipedia_url ?? undefined,
        }),
      )
      setResults([])
      setQuery(artist.name ?? '')
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
            Добавьте SANITY_STUDIO_GRAPHQL_ENDPOINT и SANITY_STUDIO_GRAPHQL_API_KEY в apps/studio/.env, чтобы подключить глобальный каталог художников.
          </Text>
        </Card>
      )}

      {selectedArtist?.id ? (
        <Card padding={3} radius={2} shadow={1} border>
          <Stack space={2}>
            <Flex align="center" justify="space-between">
              <Stack space={1}>
                <Text size={2} weight="bold">
                  {selectedArtist.name ?? 'Выбранный художник'}
                </Text>
                <Text size={1} muted>
                  GraphQL ID: {selectedArtist.id}
                </Text>
              </Stack>
              <Button icon={RefreshIcon} mode="ghost" text="Очистить" onClick={handleClear} disabled={readOnly} />
            </Flex>
            {selectedArtist.country && (
              <Text size={1} muted>
                {selectedArtist.country}
              </Text>
            )}
            {selectedArtist.description && (
              <Text size={1}>{selectedArtist.description}</Text>
            )}
          </Stack>
        </Card>
      ) : (
        <Text size={1} muted>
          Найдите художника в GraphQL каталоге и привяжите историю к живой карточке.
        </Text>
      )}

      <Flex gap={2}>
        <TextInput
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Поиск по имени, стране или описанию"
          disabled={!isConfigured || readOnly}
        />
        <Button
          icon={SearchIcon}
          text="Найти"
          tone="primary"
          disabled={!isConfigured || readOnly || !query.trim()}
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
          {results.map((artist) => (
            <Card
              key={artist.id}
              as="button"
              padding={3}
              radius={2}
              shadow={1}
              border
              onClick={() => handleSelect(artist)}
              disabled={readOnly}
            >
              <Stack space={1}>
                <Text size={2} weight="semibold">
                  {artist.name ?? 'Без названия'}
                </Text>
                <Text size={1} muted>
                  {[artist.country, artist.birth_year ? `b. ${artist.birth_year}` : undefined]
                    .filter(Boolean)
                    .join(' • ') || 'Нет данных'}
                </Text>
                {artist.description && (
                  <Text size={1} muted>
                    {artist.description.length > 160
                      ? `${artist.description.slice(0, 157)}…`
                      : artist.description}
                  </Text>
                )}
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  )
}

export default GraphqlArtistInput
