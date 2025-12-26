/// <reference types="vite/client" />

import React, {useState, useCallback} from 'react'
import {Stack, Text, TextInput, Card, Button, Flex, Spinner} from '@sanity/ui'
import {set, unset} from 'sanity'
import type {ObjectInputProps} from 'sanity'
import {SearchIcon, CloseIcon} from '@sanity/icons'

// Env variables for GraphQL - will be undefined during schema extraction
const GRAPHQL_ENDPOINT = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.SANITY_STUDIO_GRAPHQL_ENDPOINT : undefined;
const GRAPHQL_API_KEY = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.SANITY_STUDIO_GRAPHQL_API_KEY : undefined;
const GRAPHQL_TENANT_ID = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.SANITY_STUDIO_GRAPHQL_TENANT_ID : undefined) || 'artflaneur';

interface GraphqlExhibition {
  id: string
  title?: string | null
  galleryname?: string | null
  city?: string | null
  datefrom?: string | null
  dateto?: string | null
  gallery_id?: string | null
}

const SEARCH_EXHIBITIONS_QUERY = `#graphql
  query SearchExhibitions($filter: ExhibitionFilterInput, $limit: Int) {
    listAllExhibitions(filter: $filter, limit: $limit) {
      items {
        id
        title
        galleryname
        city
        datefrom
        dateto
        gallery_id
      }
    }
  }
`

async function searchExhibitions(searchTerm: string): Promise<GraphqlExhibition[]> {
  if (!GRAPHQL_ENDPOINT || !GRAPHQL_API_KEY) {
    console.warn('GraphQL API not configured')
    return []
  }

  const filter = {
    or: [
      {title: {contains: searchTerm}},
      {galleryname: {contains: searchTerm}},
      {city: {contains: searchTerm}},
    ],
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': GRAPHQL_API_KEY,
      'x-tenant-id': GRAPHQL_TENANT_ID,
    },
    body: JSON.stringify({
      query: SEARCH_EXHIBITIONS_QUERY,
      variables: {filter, limit: 20},
    }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data?.data?.listAllExhibitions?.items ?? []
}

const GraphqlExhibitionInput: React.FC<ObjectInputProps> = (props) => {
  const {value, onChange} = props
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<GraphqlExhibition[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedExhibition = value as
    | {id?: string; title?: string; gallery?: {name?: string}}
    | undefined

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const exhibitions = await searchExhibitions(searchTerm)
      setResults(exhibitions)
    } catch (err) {
      console.error('Failed to search exhibitions:', err)
      setError('Unable to search exhibitions. Check console for details.')
    } finally {
      setLoading(false)
    }
  }, [searchTerm])

  const handleSelect = useCallback(
    (exhibition: GraphqlExhibition) => {
      onChange(
        set({
          _type: 'externalExhibitionReference',
          id: exhibition.id,
          title: exhibition.title ?? undefined,
          startDate: exhibition.datefrom ?? undefined,
          endDate: exhibition.dateto ?? undefined,
          gallery: {
            _type: 'object',
            id: exhibition.gallery_id ?? undefined,
            name: exhibition.galleryname ?? undefined,
            city: exhibition.city ?? undefined,
          },
        }),
      )
      setSearchTerm('')
      setResults([])
    },
    [onChange],
  )

  const handleClear = useCallback(() => {
    onChange(unset())
    setSearchTerm('')
    setResults([])
  }, [onChange])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        handleSearch()
      }
    },
    [handleSearch],
  )

  if (selectedExhibition?.id) {
    return (
      <Card padding={3} radius={2} shadow={1} tone="primary">
        <Flex align="center" justify="space-between">
          <Stack space={2}>
            <Text size={1} weight="semibold">
              {selectedExhibition.title || 'Untitled Exhibition'}
            </Text>
            <Text size={1} muted>
              {selectedExhibition.gallery?.name
                ? `${selectedExhibition.gallery.name}`
                : 'No gallery info'}
            </Text>
            <Text size={0} muted>
              ID: {selectedExhibition.id}
            </Text>
          </Stack>
          <Button
            icon={CloseIcon}
            mode="ghost"
            tone="critical"
            onClick={handleClear}
            title="Clear selection"
          />
        </Flex>
      </Card>
    )
  }

  return (
    <Stack space={3}>
      <Flex gap={2}>
        <TextInput
          placeholder="Search by title, gallery, or city..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
          radius={2}
          fontSize={2}
          disabled={loading}
        />
        <Button
          icon={SearchIcon}
          text="Search"
          onClick={handleSearch}
          tone="primary"
          disabled={loading || !searchTerm.trim()}
        />
      </Flex>

      {loading && (
        <Card padding={3} radius={2} tone="transparent">
          <Flex align="center" justify="center">
            <Spinner />
            <Text size={1} muted style={{marginLeft: 8}}>
              Searching GraphQL catalog...
            </Text>
          </Flex>
        </Card>
      )}

      {error && (
        <Card padding={3} radius={2} tone="critical">
          <Text size={1}>{error}</Text>
        </Card>
      )}

      {!loading && results.length === 0 && searchTerm.trim() && !error && (
        <Card padding={3} radius={2} tone="transparent">
          <Text size={1} muted>
            No exhibitions found. Try a different search term.
          </Text>
        </Card>
      )}

      {results.length > 0 && (
        <Stack space={2}>
          <Text size={1} weight="semibold" muted>
            {results.length} result{results.length !== 1 ? 's' : ''}
          </Text>
          {results.map((exhibition) => (
            <Card
              key={exhibition.id}
              padding={3}
              radius={2}
              shadow={1}
              tone="default"
              style={{cursor: 'pointer'}}
              onClick={() => handleSelect(exhibition)}
            >
              <Stack space={2}>
                <Text size={1} weight="semibold">
                  {exhibition.title || 'Untitled'}
                </Text>
                <Text size={1} muted>
                  {[exhibition.galleryname, exhibition.city].filter(Boolean).join(' • ')}
                </Text>
                {exhibition.datefrom && (
                  <Text size={0} muted>
                    {exhibition.datefrom}
                    {exhibition.dateto && ` – ${exhibition.dateto}`}
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

export default GraphqlExhibitionInput
