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
  artist?: string | null
  description?: string | null
  eventtype?: string | null
  exhibition_type?: string[] | string | null
}

interface GraphqlGallery {
  id: string
  galleryname?: string | null
  city?: string | null
  fulladdress?: string | null
  placeurl?: string | null
  openinghours?: string | null
  allowed?: string | null
  specialevent?: string | null
  eventtype?: string | null
}

type ListExhibitionsResponse = {
  data?: {
    listAllExhibitions?: {
      items?: GraphqlExhibition[]
      nextToken?: string | null
    }
  }
}

type GetGalleryResponse = {
  data?: {
    getGalleryById?: GraphqlGallery | null
  }
}

const SEARCH_EXHIBITIONS_QUERY = `#graphql
  query SearchExhibitions($limit: Int, $nextToken: String) {
    listAllExhibitions(limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        galleryname
        city
        datefrom
        dateto
        gallery_id
        artist
        description
        eventtype
        exhibition_type
      }
      nextToken
    }
  }
`

const GET_GALLERY_QUERY = `#graphql
  query GetGalleryById($id: ID!) {
    getGalleryById(id: $id) {
      id
      galleryname
      city
      fulladdress
      placeurl
      openinghours
      allowed
      specialevent
      eventtype
    }
  }
`

async function searchExhibitions(searchTerm: string): Promise<GraphqlExhibition[]> {
  console.log('🔍 [Exhibition Search] Starting search...')
  console.log('🔍 [Exhibition Search] Endpoint:', GRAPHQL_ENDPOINT)
  console.log('🔍 [Exhibition Search] API Key:', GRAPHQL_API_KEY ? 'SET' : 'NOT SET')
  console.log('🔍 [Exhibition Search] Tenant ID:', GRAPHQL_TENANT_ID)
  console.log('🔍 [Exhibition Search] Search term:', searchTerm)

  if (!GRAPHQL_ENDPOINT || !GRAPHQL_API_KEY) {
    console.error('❌ [Exhibition Search] GraphQL API not configured!')
    return []
  }

  const searchLower = searchTerm.toLowerCase().trim()
  if (!searchLower) {
    return []
  }

  const results: GraphqlExhibition[] = []
  let nextToken: string | null | undefined = null
  const PAGE_SIZE = 100
  const MAX_PAGES = 10 // Search first 1000 exhibitions
  const MAX_RESULTS = 20

  console.log('🔍 [Exhibition Search] Starting pagination search...')

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const requestBody: {
      query: string
      variables: {limit: number; nextToken: string | null | undefined}
    } = {
      query: SEARCH_EXHIBITIONS_QUERY,
      variables: { limit: PAGE_SIZE, nextToken },
    }

    console.log(`🔍 [Exhibition Search] Page ${page + 1}, nextToken:`, nextToken || 'null')

    const response: Response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': GRAPHQL_API_KEY,
        'x-tenant-id': GRAPHQL_TENANT_ID,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Exhibition Search] Request failed:', errorText)
      throw new Error(`GraphQL request failed: ${response.statusText}`)
    }

    const data: ListExhibitionsResponse = await response.json()
    const items = data.data?.listAllExhibitions?.items ?? []
    
    console.log(`🔍 [Exhibition Search] Page ${page + 1} returned ${items.length} items`)

    // Client-side filtering
    const matching = items.filter((exhibition: GraphqlExhibition) => {
      const titleMatch = exhibition.title?.toLowerCase().includes(searchLower)
      const galleryMatch = exhibition.galleryname?.toLowerCase().includes(searchLower)
      const cityMatch = exhibition.city?.toLowerCase().includes(searchLower)
      const artistMatch = exhibition.artist?.toLowerCase().includes(searchLower)
      
      return titleMatch || galleryMatch || cityMatch || artistMatch
    })

    console.log(`🔍 [Exhibition Search] Found ${matching.length} matching exhibitions on page ${page + 1}`)
    
    results.push(...matching)

    // Stop if we have enough results
    if (results.length >= MAX_RESULTS) {
      break
    }

    nextToken = data.data?.listAllExhibitions?.nextToken ?? null
    if (!nextToken) {
      console.log('🔍 [Exhibition Search] No more pages')
      break
    }
  }

  const finalResults = results.slice(0, MAX_RESULTS)
  console.log('✅ [Exhibition Search] Returning', finalResults.length, 'exhibitions')

  return finalResults
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

  const fetchGalleryDetails = useCallback(async (galleryId?: string | null) => {
    if (!galleryId || !GRAPHQL_ENDPOINT || !GRAPHQL_API_KEY) {
      return null
    }

    try {
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
        console.error('❌ [Gallery Fetch] Request failed:', errorText)
        return null
      }

      const payload: GetGalleryResponse = await response.json()
      return payload.data?.getGalleryById ?? null
    } catch (err) {
      console.error('❌ [Gallery Fetch] Unexpected error:', err)
      return null
    }
  }, [])

  const handleSelect = useCallback(
    async (exhibition: GraphqlExhibition) => {
      const galleryDetails = await fetchGalleryDetails(exhibition.gallery_id)

      const normalizedExhibitionType = Array.isArray(exhibition.exhibition_type)
        ? exhibition.exhibition_type.filter(Boolean).join(', ')
        : exhibition.exhibition_type ?? undefined

      onChange(
        set({
          _type: 'externalExhibitionReference',
          id: exhibition.id,
          title: exhibition.title ?? undefined,
          startDate: exhibition.datefrom ?? undefined,
          endDate: exhibition.dateto ?? undefined,
          artist: exhibition.artist ?? undefined,
          eventType: exhibition.eventtype ?? undefined,
          exhibitionType: normalizedExhibitionType,
          description: exhibition.description ?? undefined,
          gallery: {
            _type: 'object',
            id: exhibition.gallery_id ?? galleryDetails?.id ?? undefined,
            name: exhibition.galleryname ?? galleryDetails?.galleryname ?? undefined,
            city: exhibition.city ?? galleryDetails?.city ?? undefined,
            address: galleryDetails?.fulladdress ?? undefined,
            website: galleryDetails?.placeurl ?? undefined,
            openingHours: galleryDetails?.openinghours ?? undefined,
            allowed: galleryDetails?.allowed ?? undefined,
            specialEvent: galleryDetails?.specialevent ?? undefined,
            eventType: galleryDetails?.eventtype ?? undefined,
          },
        }),
      )
      setSearchTerm('')
      setResults([])
    },
    [fetchGalleryDetails, onChange],
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
          <Flex align="center" justify="center" direction="column" gap={2}>
            <Spinner />
            <Text size={1} muted align="center">
              Searching global exhibition catalog...
            </Text>
            <Text size={0} muted align="center">
              This may take 5-10 seconds ⏱️
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
              onClick={() => {
                void handleSelect(exhibition)
              }}
            >
              <Stack space={2}>
                <Text size={1} weight="semibold">
                  {exhibition.title || 'Untitled'}
                </Text>
                {exhibition.artist && (
                  <Text size={1} style={{fontStyle: 'italic'}}>
                    {exhibition.artist}
                  </Text>
                )}
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
