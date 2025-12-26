# GraphQL API Reference Guide

This guide explains the available GraphQL queries for accessing gallery and exhibition data.

## Table of Contents

1. [Introduction](#introduction)
2. [Data Types](#data-types)
   - [Gallery](#gallery)
   - [Exhibition](#exhibition)
   - [Artist](#artist)
   - [ExhibitionArtist](#exhibitionartist)
   - [UserProfile](#userprofile)
   - [UserFavorite](#userfavorite)
   - [ExhibitionMetadata](#exhibitionmetadata)
3. [Queries](#queries)
   - [Gallery Queries](#gallery-queries)
     - [Get a Gallery by ID](#get-a-gallery-by-id)
     - [List Galleries by ID](#list-galleries-by-id)
     - [Find Nearby Galleries by ID](#find-nearby-galleries-by-id)
   - [Exhibition Queries](#exhibition-queries)
     - [Get an Exhibition by ID](#get-an-exhibition-by-id)
     - [List Exhibitions by Gallery ID](#list-exhibitions-by-gallery-id)
     - [Querying Exhibitions with Artist Information](#querying-exhibitions-with-artist-information)
     - [List Special Events](#list-special-events)
     - [List Special Events By ID](#list-special-events-by-id)
     - [List All Current and Upcoming Exhibitions (with optional distance)](#list-all-current-and-upcoming-exhibitions)
     - [List All Historical Exhibitions (Including Past Exhibitions)](#list-all-historical-exhibitions-including-past-exhibitions)
   - [Artist Queries](#artist-queries)
     - [Get an Artist by ID](#get-an-artist-by-id)
     - [Get Exhibitions for an Artist](#get-exhibitions-for-an-artist)
     - [Find Exhibitions for an Artist (Alternative)](#find-exhibitions-for-an-artist-alternative)
     - [List All Artists](#list-all-artists)
   - [Metadata Queries](#metadata-queries)
     - [Get Exhibition Metadata](#get-exhibition-metadata)
   - [User Profile Queries](#user-profile-queries)
     - [Get a User Profile](#get-a-user-profile)
     - [List User Profiles](#list-user-profiles)
   - [User Favorites Queries](#user-favorites-queries)
     - [Get a User Favorite](#get-a-user-favorite)
     - [Get User Favorites](#get-user-favorites)
     - [Get User Gallery Favorites By ID](#get-user-gallery-favorites-by-id)
     - [Get User Exhibition Favorites By ID](#get-user-exhibition-favorites-by-id)
4. [Mutations](#mutations)
   - [User Profile Mutations](#user-profile-mutations)
     - [Create User Profile](#create-user-profile)
     - [Update User Profile](#update-user-profile)
     - [Delete User Profile](#delete-user-profile)
   - [User Favorites Mutations](#user-favorites-mutations)
     - [Add Favorite](#add-favorite)
     - [Remove Favorite](#remove-favorite)
5. [Working with Dates](#working-with-dates)
6. [Pagination](#pagination)
7. [Filter Options](#filter-options)
8. [API Authentication](#api-authentication)
9. [React Native Examples](#react-native-examples)
10. [Backward Compatibility and Migration](#backward-compatibility-and-migration)

## Introduction

Our GraphQL API provides read access to galleries and exhibitions data. You can:

- Get information about galleries
- Find galleries near a location
- Get information about exhibitions

The API uses database IDs as identifiers for all resources, providing efficient and stable access to data.

## Data Types

### Gallery

A gallery represents an art gallery or exhibition space.

| Field | Type | Description |
|-------|------|-------------|
| id | ID! | The database ID of the gallery (primary key) |
| galleryname | String! | The name of the gallery |
| placeurl | String | URL of the gallery website |
| openinghours | String | Opening hours information |
| specialevent | String | Special event information |
| country | String | Country where gallery is located |
| added | AWSDateTime | Timestamp when the gallery was added |
| gallery_img | String | URL to gallery image |
| gallery_img_url | String | URL to gallery image from Directus CDN |
| datefrom | AWSDateTime | Exhibition start date |
| datefrom_epoch | Int | Exhibition start date as epoch timestamp (seconds since 1970) |
| lon | String | Longitude coordinate |
| dateto | AWSDateTime | Exhibition end date |
| dateto_epoch | Int | Exhibition end date as epoch timestamp (seconds since 1970) |
| updated | AWSDateTime | Timestamp when the gallery was last updated |
| fulladdress | String | Full address of the gallery |
| lat | String | Latitude coordinate |
| allowed | String | Permission status |
| logo_img_url | String | URL to logo image from the most relevant current exhibition |
| eventtype | String | Event type from the most relevant current exhibition |
| exhibitions | ExhibitionConnection | A connection to fetch exhibitions associated with this gallery |
| favoritedBy | UserFavoriteConnection | A connection to fetch users who favorited this gallery |

### Exhibition

An exhibition represents an art exhibition at a gallery.

| Field | Type | Description |
|-------|------|-------------|
| id | ID! | The database ID of the exhibition (primary key) |
| galleryname | String! | The name of the gallery this exhibition belongs to |
| gallery_id | ID! | The database ID of the gallery this exhibition belongs to |
| title | String! | The title of the exhibition |
| img_url | String | URL to exhibition image |
| exhibition_img_url | String | URL to exhibition image from Directus CDN |
| artist | String | Artist name(s) (original field for backward compatibility) |
| artists | [ExhibitionArtist!]! | List of artists associated with this exhibition with relationship details |
| hasArtistRelationships | Boolean! | Whether this exhibition has any artist relationships defined |
| dateto | AWSDateTime | Exhibition end date |
| dateto_epoch | Int | Exhibition end date as epoch timestamp (seconds since 1970) |
| eventtype | String | Type of exhibition event |
| exhibition_type | AWSJSON | Array of exhibition types as JSON |
| datefrom | AWSDateTime | Exhibition start date |
| datefrom_epoch | Int | Exhibition start date as epoch timestamp (seconds since 1970) |
| description | String | Exhibition description |
| city | String | City where exhibition is held |
| logo | String | URL to exhibition logo |
| logo_img_url | String | URL to exhibition logo from Directus CDN |
| distanceInKm | Float | Distance from provided coordinates in kilometers (only available when latitude and longitude are provided in queries) |
| gallery | Gallery | The gallery this exhibition belongs to |

### Artist

An artist represents an individual artist in the system.

| Field | Type | Description |
|-------|------|-------------|
| id | ID! | Unique identifier for the artist (UUID) |
| name | String! | The artist's name |
| description | String | Biographical or descriptive information about the artist |
| birth_year | Int | Year the artist was born |
| death_year | Int | Year the artist died (null if still alive) |
| country | String | Country associated with the artist |
| wikipedia_url | String | URL to the artist's Wikipedia page |
| date_created | AWSDateTime | Timestamp when the artist record was created |
| date_updated | AWSDateTime | Timestamp when the artist record was last updated |
| exhibitions | ExhibitionConnection | A connection to fetch exhibitions associated with this artist |

### ExhibitionArtist

An exhibition-artist relationship that connects exhibitions to artists with additional metadata.

| Field | Type | Description |
|-------|------|-------------|
| id | ID! | Unique identifier for the exhibition-artist relationship (UUID) |
| exhibition_id | ID! | The database ID of the exhibition this relationship belongs to |
| artist | Artist! | The artist associated with this exhibition |
| display_order | Int | Optional order for displaying artists (null means no specific order) |
| confidence_score | Float | Confidence score of the artist match (0.0-1.0) |
| date_created | AWSDateTime | Timestamp when the relationship was created |
| date_updated | AWSDateTime | Timestamp when the relationship was last updated |

### UserProfile

A user profile represents a user in the system.

| Field | Type | Description |
|-------|------|-------------|
| id | ID! | Unique identifier for the user profile |
| status | String! | Status of the user profile (e.g., 'draft', 'published') |
| firstname | String | User's first name |
| lastname | String | User's last name |
| email | String | User's email address |
| avatar | String | URL to user's avatar image |
| appleUserId | String | Apple's persistent user identifier for Apple Sign-In users |
| date_created | AWSDateTime | Timestamp when the user profile was created |
| date_updated | AWSDateTime | Timestamp when the user profile was last updated |
| favorites | UserFavoriteConnection | A connection to fetch favorites associated with this user |

### UserFavorite

A user favorite represents either a gallery or an exhibition that has been favorited by a user.

| Field | Type | Description |
|-------|------|-------------|
| id | ID! | Unique identifier for the favorite |
| userId | ID! | ID of the user who favorited the gallery or exhibition |
| galleryId | Int | ID of the favorited gallery (null for exhibition favorites) |
| exhibitionId | Int | ID of the favorited exhibition (null for gallery favorites) |
| targetType | String! | Type of the favorite ("gallery" or "exhibition") |
| date_created | AWSDateTime | Timestamp when the favorite was created |
| date_updated | AWSDateTime | Timestamp when the favorite was last updated |
| user | UserProfile | The user who favorited the gallery or exhibition |
| gallery | Gallery | The favorited gallery (null for exhibition favorites) |
| exhibition | Exhibition | The favorited exhibition (null for gallery favorites) |

### ExhibitionMetadata

Metadata for exhibition-related dropdown fields. Contains available options for event types and exhibition types.

| Field | Type | Description |
|-------|------|-------------|
| eventTypes | [String!]! | Available event type options (e.g., Exhibition, Biennale, Festival, Art Fair) |
| exhibitionTypes | [String!]! | Available exhibition type/category options (e.g., Solo Exhibition, Group Exhibition, Retrospective) |

## Queries

### Get a Gallery by ID

Get a single gallery by its database ID. This query also returns information from its most relevant exhibition (prioritizing current exhibitions, special events, and then most recent exhibitions).

**Query:**

```graphql
query GetGalleryById($id: ID!) {
  getGalleryById(id: $id) {
    id
    galleryname
    placeurl
    openinghours
    specialevent
    country
    gallery_img_url
    datefrom
    datefrom_epoch
    dateto
    dateto_epoch
    fulladdress
    lat
    lon
    logo_img_url
    eventtype
  }
}
```

**Variables:**

```json
{
  "id": "1"
}
```

### List Galleries by ID

Get a list of galleries with optional filtering. For each gallery, this query also returns information from its most relevant exhibition (prioritizing current exhibitions, special events, and then most recent exhibitions).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | Int | No | Maximum number of galleries to return per page (default: 50, max: 100) |
| `nextToken` | String | No | Pagination token to fetch the next page of results |
| `filter` | GalleryFilterInput | No | Criteria to filter the list of galleries |
| `includeUnapproved` | Boolean | No | When `true`, includes galleries where `allowed` is set to "no" (unapproved galleries). Defaults to `false` |

**Query:**

```graphql
query ListGalleriesById($limit: Int, $nextToken: String, $filter: GalleryFilterInput, $includeUnapproved: Boolean) {
  listGalleriesById(limit: $limit, nextToken: $nextToken, filter: $filter, includeUnapproved: $includeUnapproved) {
    items {
      id
      galleryname
      country
      gallery_img_url
      datefrom
      datefrom_epoch
      dateto
      dateto_epoch
      fulladdress
      lat
      lon
      logo_img_url
      eventtype
    }
    nextToken
  }
}
```

**Variables:**

```json
{
  "limit": 10,
  "nextToken": null,
  "filter": {
    "country": {
      "eq": "Japan"
    }
  }
}
```

**Variables (Including Unapproved Galleries for Management):**

```json
{
  "limit": 50,
  "includeUnapproved": true
}
```

> **Note:** The `includeUnapproved` parameter is intended for gallery management interfaces. When set to `true`, the query returns all galleries regardless of their approval status. By default (when omitted or `false`), only galleries where `allowed` is "yes" or empty are returned.

### Find Nearby Galleries by ID

Find galleries near a specific location within a radius. For each gallery, this query also returns information from its most relevant exhibition (prioritizing current exhibitions, special events, and then most recent exhibitions).

**Query:**

```graphql
query NearbyGalleriesById($latitude: Float!, $longitude: Float!, $radiusInKm: Float!, $limit: Int) {
  nearbyGalleriesById(latitude: $latitude, longitude: $longitude, radiusInKm: $radiusInKm, limit: $limit) {
    items {
      id
      galleryname
      gallery_img_url
      datefrom_epoch
      dateto_epoch
      fulladdress
      lat
      lon
      distanceInKm
      logo_img_url
      eventtype
    }
    nextToken
  }
}
```

**Variables:**

```json
{
  "latitude": 35.6812,
  "longitude": 139.7671,
  "radiusInKm": 5,
  "limit": 10
}
```

**Note:** Similar distance calculation functionality is also available for exhibitions. See [List All Current and Upcoming Exhibitions](#list-all-current-and-upcoming-exhibitions) for exhibitions with optional distance calculation.

### Get an Exhibition by ID

Get a single exhibition by its database ID.

**Query:**

```graphql
query GetExhibitionById($id: ID!) {
  getExhibitionById(id: $id) {
    id
    galleryname
    gallery_id
    title
    artist
    artists {
      id
      exhibition_id
      display_order
      confidence_score
      date_created
      date_updated
      artist {
        id
        name
        description
        birth_year
        death_year
        country
        wikipedia_url
        date_created
        date_updated
      }
    }
    hasArtistRelationships
    datefrom
    datefrom_epoch
    dateto
    dateto_epoch
    eventtype
    exhibition_type
    description
    city
    exhibition_img_url
    logo_img_url
  }
}
```

**Variables:**

```json
{
  "id": "1"
}
```

### List Exhibitions by Gallery ID

Get a list of exhibitions for a specific gallery using the gallery's ID.

**Query:**

```graphql
query ListExhibitionsByGalleryId($galleryId: ID!, $limit: Int, $nextToken: String) {
  listExhibitionsByGalleryId(galleryId: $galleryId, limit: $limit, nextToken: $nextToken) {
    items {
      id
      galleryname
      gallery_id
      title
      artist
      datefrom
      datefrom_epoch
      dateto
      dateto_epoch
      eventtype
      exhibition_type
      description
      city
      exhibition_img_url
    }
    nextToken
  }
}
```

**Variables:**

```json
{
  "galleryId": "1",
  "limit": 10,
  "nextToken": null
}
```

#### Querying Exhibitions with Artist Information

To get exhibitions with detailed artist relationship information, you can include the `artists` and `hasArtistRelationships` fields in your exhibition queries:

**Query:**

```graphql
query ListExhibitionsWithArtists($galleryId: ID!, $limit: Int, $nextToken: String) {
  listExhibitionsByGalleryId(galleryId: $galleryId, limit: $limit, nextToken: $nextToken) {
    items {
      id
      galleryname
      gallery_id
      title
      artist
      hasArtistRelationships
      artists {
        id
        exhibition_id
        display_order
        confidence_score
        artist {
          id
          name
          description
          birth_year
          death_year
          country
          wikipedia_url
        }
      }
      datefrom
      dateto
      eventtype
      exhibition_type
      description
      city
      exhibition_img_url
    }
    nextToken
  }
}
```

**Example Response:**

```json
{
  "data": {
    "listExhibitionsByGalleryId": {
      "items": [
        {
          "id": "123",
          "galleryname": "Modern Art Gallery",
          "gallery_id": "1",
          "title": "Contemporary Visions",
          "artist": "Pablo Picasso, Vincent van Gogh",
          "hasArtistRelationships": true,
          "artists": [
            {
              "id": "ea123-456-789",
              "exhibition_id": "123",
              "display_order": 1,
              "confidence_score": 1.0,
              "artist": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "name": "Pablo Picasso",
                "description": "Spanish painter, sculptor, printmaker",
                "birth_year": 1881,
                "death_year": 1973,
                "country": "Spain",
                "wikipedia_url": "https://en.wikipedia.org/wiki/Pablo_Picasso"
              }
            },
            {
              "id": "ea789-012-345",
              "exhibition_id": "123",
              "display_order": 2,
              "confidence_score": 1.0,
              "artist": {
                "id": "660f9511-f3ac-52e5-b827-557766551111",
                "name": "Vincent van Gogh",
                "description": "Dutch post-impressionist painter",
                "birth_year": 1853,
                "death_year": 1890,
                "country": "Netherlands",
                "wikipedia_url": "https://en.wikipedia.org/wiki/Vincent_van_Gogh"
              }
            }
          ],
          "datefrom": "2024-03-01T00:00:00.000Z",
          "dateto": "2024-06-30T23:59:59.000Z",
          "eventtype": "Exhibition",
          "exhibition_type": ["group", "contemporary"],
          "description": "A showcase of contemporary artistic visions",
          "city": "Sydney",
          "exhibition_img_url": "https://assets.artflaneur.com.au/directus_uploads/contemporary-visions.jpg"
        }
      ],
      "nextToken": null
    }
  }
}
```

### List Historical Exhibitions by Gallery ID

Get a complete list of exhibitions for a gallery **including past exhibitions**. This query mirrors `listExhibitionsByGalleryId` but removes the end-date filter, so it returns every historical record for the gallery.

**Query:**

```graphql
query ListHistoricalExhibitionsByGalleryId($galleryId: ID!, $limit: Int, $nextToken: String) {
  listHistoricalExhibitionsByGalleryId(galleryId: $galleryId, limit: $limit, nextToken: $nextToken) {
    items {
      id
      galleryname
      gallery_id
      title
      artist
      datefrom
      datefrom_epoch
      dateto
      dateto_epoch
      eventtype
      exhibition_type
      description
      city
      exhibition_img_url
    }
    nextToken
  }
}
```

**Variables:**

```json
{
  "galleryId": "1",
  "limit": 20
}
```

> **When to use which query?** Use `listExhibitionsByGalleryId` for **current + upcoming** listings (filters out ended shows). Use `listHistoricalExhibitionsByGalleryId` when you need the gallery's full exhibition history.

**Note:** The `hasArtistRelationships` field allows you to quickly check if an exhibition has detailed artist information without having to query the `artists` array. If `hasArtistRelationships` is `false`, the `artists` array will be empty.

### List Special Events

Get a list of all events that have an eventtype value that is NOT 'Exhibition'. This is useful for finding special events, workshops, talks, and other non-exhibition events.

**Query:**

```graphql
query ListSpecialEvents($limit: Int, $nextToken: String) {
  listSpecialEvents(limit: $limit, nextToken: $nextToken) {
    items {
      id
      galleryname
      gallery_id
      title
      eventtype
      exhibition_type
      artist
      datefrom
      datefrom_epoch
      dateto
      dateto_epoch
      description
      city
      exhibition_img_url
    }
    nextToken
  }
}
```

**Variables:**

```json
{
  "limit": 10,
  "nextToken": null
}
```

### List Special Events By ID

Get a list of all events with ID-based access that have an eventtype value that is NOT 'Exhibition'. This returns the same type of events as `listSpecialEvents` but with ID-based access.

**Query:**

```graphql
query ListSpecialEventsById($limit: Int, $nextToken: String) {
  listSpecialEventsById(limit: $limit, nextToken: $nextToken) {
    items {
      id
      galleryname
      gallery_id
      title
      eventtype
      exhibition_type
      artist
      datefrom
      datefrom_epoch
      dateto
      dateto_epoch
      description
      city
      exhibition_img_url
    }
    nextToken
  }
}
```

**Variables:**

```json
{
  "limit": 10,
  "nextToken": null
}
```

### List All Current and Upcoming Exhibitions

Get a list of all exhibitions across all galleries that haven't ended yet (both current and upcoming exhibitions). This is useful for showing all active and future exhibitions regardless of gallery.

**Features:**
- **Standard listing**: Returns all current and upcoming exhibitions
- **Distance calculation**: When latitude and longitude are provided, results include distance from the specified coordinates
- **Pagination**: Supports limit and nextToken for paginated results
- **Distance ordering**: When coordinates are provided, results are ordered by distance

**Query (Standard):**

```graphql
query ListAllExhibitions($limit: Int, $nextToken: String) {
  listAllExhibitions(limit: $limit, nextToken: $nextToken) {
    items {
      id
      galleryname
      gallery_id
      title
      eventtype
      exhibition_type
      artist
      datefrom
      datefrom_epoch
      dateto
      dateto_epoch
      description
      city
      exhibition_img_url
      distanceInKm
    }
    nextToken
  }
}
```

**Query (With Distance Calculation):**

```graphql
query ListAllExhibitionsWithDistance($limit: Int, $nextToken: String, $latitude: Float!, $longitude: Float!) {
  listAllExhibitions(limit: $limit, nextToken: $nextToken, latitude: $latitude, longitude: $longitude) {
    items {
      id
      galleryname
      gallery_id
      title
      eventtype
      exhibition_type
      artist
      datefrom
      datefrom_epoch
      dateto
      dateto_epoch
      description
      city
      exhibition_img_url
      distanceInKm
    }
    nextToken
  }
}
```

**Variables (Standard):**

```json
{
  "limit": 20,
  "nextToken": null
}
```

**Variables (With Distance):**

```json
{
  "limit": 20,
  "nextToken": null,
  "latitude": -37.8136,
  "longitude": 144.9631
}
```

**Parameters:**

- `limit` (Int, optional): Maximum number of exhibitions to return per page (default: 50, max: 100)
- `nextToken` (String, optional): Pagination token to fetch the next page of results
- `latitude` (Float, optional): Latitude coordinate for distance calculation (must be between -90 and 90)
- `longitude` (Float, optional): Longitude coordinate for distance calculation (must be between -180 and 180)

**Notes:**
- Both `latitude` and `longitude` must be provided together or both omitted
- When coordinates are provided, results include `distanceInKm` field and are ordered by distance
- When coordinates are omitted, `distanceInKm` field will be `null` and results are ordered by exhibition ID
- Distance calculation uses PostGIS spatial functions for accurate geographic distance

### List All Historical Exhibitions (Including Past Exhibitions)

Get a list of **all exhibitions** across all galleries including past, current, and future exhibitions. Unlike `listAllExhibitions` which only returns current and upcoming exhibitions, this query returns every exhibition in the database regardless of dates.

**Features:**
- **Complete historical data**: Returns ALL exhibitions including those that have already ended
- **Artist relationships included**: Each exhibition includes full artist relationship data
- **Distance calculation**: When latitude and longitude are provided, results include distance from the specified coordinates
- **Pagination**: Supports limit and nextToken for paginated results
- **Distance ordering**: When coordinates are provided, results are ordered by distance

**Query (Standard):**

```graphql
query ListAllHistoricalExhibitions($limit: Int, $nextToken: String) {
  listAllHistoricalExhibitions(limit: $limit, nextToken: $nextToken) {
    items {
      id
      galleryname
      gallery_id
      title
      eventtype
      exhibition_type
      artist
      artists {
        id
        exhibition_id
        display_order
        confidence_score
        artist {
          id
          name
          description
          birth_year
          death_year
          country
          wikipedia_url
        }
      }
      hasArtistRelationships
      datefrom
      datefrom_epoch
      dateto
      dateto_epoch
      description
      city
      exhibition_img_url
      logo_img_url
      distanceInKm
    }
    nextToken
  }
}
```

**Query (With Distance Calculation):**

```graphql
query ListAllHistoricalExhibitionsWithDistance($limit: Int, $nextToken: String, $latitude: Float!, $longitude: Float!) {
  listAllHistoricalExhibitions(limit: $limit, nextToken: $nextToken, latitude: $latitude, longitude: $longitude) {
    items {
      id
      galleryname
      gallery_id
      title
      eventtype
      exhibition_type
      artist
      artists {
        id
        exhibition_id
        display_order
        confidence_score
        artist {
          id
          name
          description
          birth_year
          death_year
          country
          wikipedia_url
        }
      }
      hasArtistRelationships
      datefrom
      datefrom_epoch
      dateto
      dateto_epoch
      description
      city
      exhibition_img_url
      logo_img_url
      distanceInKm
    }
    nextToken
  }
}
```

**Variables (Standard):**

```json
{
  "limit": 20,
  "nextToken": null
}
```

**Variables (With Distance):**

```json
{
  "limit": 20,
  "nextToken": null,
  "latitude": -37.8136,
  "longitude": 144.9631
}
```

**Parameters:**

- `limit` (Int, optional): Maximum number of exhibitions to return per page (default: 50, max: 100)
- `nextToken` (String, optional): Pagination token to fetch the next page of results
- `latitude` (Float, optional): Latitude coordinate for distance calculation (must be between -90 and 90)
- `longitude` (Float, optional): Longitude coordinate for distance calculation (must be between -180 and 180)

**Key Differences from `listAllExhibitions`:**
- **No date filtering**: Returns ALL exhibitions regardless of their end dates
- **Includes past exhibitions**: Shows historical exhibitions that have already ended
- **Complete dataset**: Ideal for data analysis, archival purposes, or comprehensive exhibition browsing
- **Artist relationships**: Each exhibition includes full artist relationship data when available

**Use Cases:**
- **Data export/analysis**: Extract complete exhibition history for analytics
- **Archive browsing**: Allow users to browse all past exhibitions
- **Artist research**: Find all exhibitions an artist has participated in historically
- **Comprehensive search**: Search across all exhibitions ever held, not just current ones

**Notes:**
- Both `latitude` and `longitude` must be provided together or both omitted
- When coordinates are provided, results include `distanceInKm` field and are ordered by distance
- When coordinates are omitted, `distanceInKm` field will be `null` and results are ordered by exhibition ID
- Distance calculation uses PostGIS spatial functions for accurate geographic distance
- This query may return a large dataset; use pagination to manage performance
- Artist relationships are automatically included when available through the `artists` field

### Get Gallery with Nested Exhibitions

Get a gallery by ID with its associated exhibitions.

**Query:**

```graphql
query GalleryByIdWithExhibitions($id: ID!, $limit: Int) {
  getGalleryById(id: $id) {
    id
    galleryname
    placeurl
    country
    gallery_img_url
    fulladdress
    lat
    lon
    exhibitions(limit: $limit) {
      items {
        id
        title
        artist
        datefrom
        datefrom_epoch
        dateto
        dateto_epoch
        eventtype
        exhibition_type
        description
        exhibition_img_url
      }
      nextToken
    }
  }
}
```

**Variables:**

```json
{
  "id": "1",
  "limit": 5
}
```

### Artist Queries

#### Get an Artist by ID

Get detailed information about a specific artist.

**Query:**

```graphql
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
```

**Variables:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**

```json
{
  "data": {
    "getArtist": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Pablo Picasso",
      "description": "Spanish painter, sculptor, printmaker, ceramicist and theatre designer",
      "birth_year": 1881,
      "death_year": 1973,
      "country": "Spain",
      "wikipedia_url": "https://en.wikipedia.org/wiki/Pablo_Picasso"
    }
  }
}
```

#### Get Exhibitions for an Artist

Get all exhibitions associated with a specific artist, with pagination support.

**Query:**

```graphql
query GetArtistExhibitions($artistId: ID!, $limit: Int, $nextToken: String) {
  getArtist(id: $artistId) {
    id
    name
    description
    birth_year
    death_year
    country
    wikipedia_url
    exhibitions(limit: $limit, nextToken: $nextToken) {
      items {
        galleryname
        title
        artist
        datefrom
        dateto
        eventtype
        exhibition_type
        description
        city
        exhibition_img_url
        logo_img_url
      }
      nextToken
    }
  }
}
```

**Variables:**

```json
{
  "artistId": "550e8400-e29b-41d4-a716-446655440000",
  "limit": 10,
  "nextToken": null
}
```

**Response:**

```json
{
  "data": {
    "getArtist": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Pablo Picasso",
      "description": "Spanish painter, sculptor, printmaker, ceramicist and theatre designer",
      "birth_year": 1881,
      "death_year": 1973,
      "country": "Spain",
      "wikipedia_url": "https://en.wikipedia.org/wiki/Pablo_Picasso",
      "exhibitions": {
        "items": [
          {
            "galleryname": "Modern Art Gallery",
            "title": "Picasso: Blue Period Masterworks",
            "artist": "Pablo Picasso",
            "datefrom": "2024-03-01T00:00:00.000Z",
            "dateto": "2024-06-30T23:59:59.000Z",
            "eventtype": "Exhibition",
            "exhibition_type": ["solo", "retrospective"],
            "description": "A comprehensive look at Picasso's revolutionary Blue Period",
            "city": "Sydney",
            "exhibition_img_url": "https://assets.artflaneur.com.au/directus_uploads/picasso-blue-period.jpg",
            "logo_img_url": "https://assets.artflaneur.com.au/directus_uploads/picasso-logo.jpg"
          }
        ],
        "nextToken": null
      }
    }
  }
}
```

#### Find Exhibitions for an Artist (Alternative)

Find all exhibitions for a specific artist using a direct query. This is an alternative to the nested approach shown above.

**Query:**

```graphql
query FindExhibitionsForArtist($artistId: String!, $limit: Int, $nextToken: String) {
  exhibitionsForArtist(artistId: $artistId, limit: $limit, nextToken: $nextToken) {
    items {
      id
      galleryname
      title
      artist
      datefrom
      dateto
      eventtype
      exhibition_type
      description
      city
      exhibition_img_url
      logo_img_url
      artists {
        id
        name
        description
        birth_year
        death_year
        country
        wikipedia_url
      }
      hasArtistRelationships
    }
    nextToken
  }
}
```

**Variables:**

```json
{
  "artistId": "550e8400-e29b-41d4-a716-446655440000",
  "limit": 10,
  "nextToken": null
}
```

**Response:**

```json
{
  "data": {
    "exhibitionsForArtist": {
      "items": [
        {
          "id": "exhibition-123",
          "galleryname": "Modern Art Gallery",
          "title": "Picasso: Blue Period Masterworks",
          "artist": "Pablo Picasso",
          "datefrom": "2024-03-01T00:00:00.000Z",
          "dateto": "2024-06-30T23:59:59.000Z",
          "eventtype": "Exhibition",
          "exhibition_type": ["solo", "retrospective"],
          "description": "A comprehensive look at Picasso's revolutionary Blue Period",
          "city": "Sydney",
          "exhibition_img_url": "https://assets.artflaneur.com.au/directus_uploads/picasso-blue-period.jpg",
          "logo_img_url": "https://assets.artflaneur.com.au/directus_uploads/picasso-logo.jpg",
          "artists": [
            {
              "id": "550e8400-e29b-41d4-a716-446655440000",
              "name": "Pablo Picasso",
              "description": "Spanish painter, sculptor, printmaker, ceramicist and theatre designer",
              "birth_year": 1881,
              "death_year": 1973,
              "country": "Spain",
              "wikipedia_url": "https://en.wikipedia.org/wiki/Pablo_Picasso"
            }
          ],
          "hasArtistRelationships": true
        }
      ],
      "nextToken": null
    }
  }
}
```

#### List All Artists

Get a paginated list of all artists in the database. This query provides direct access to the complete artist directory without needing to go through exhibitions.

**Query:**

```graphql
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
      date_created
      date_updated
    }
    nextToken
  }
}
```

**Variables:**

```json
{
  "limit": 50,
  "nextToken": null
}
```

**Parameters:**

- `limit` (Int, optional): Maximum number of artists to return per page (default: 50, max: 100)
- `nextToken` (String, optional): Pagination token to fetch the next page of results

**Response:**

```json
{
  "data": {
    "listAllArtists": {
      "items": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "Pablo Picasso",
          "description": "Spanish painter, sculptor, printmaker, ceramicist and theatre designer",
          "birth_year": 1881,
          "death_year": 1973,
          "country": "Spain",
          "wikipedia_url": "https://en.wikipedia.org/wiki/Pablo_Picasso",
          "date_created": "2024-01-15T10:30:00.000Z",
          "date_updated": "2024-01-15T10:30:00.000Z"
        },
        {
          "id": "660f9511-f3ac-52e5-b827-557766551111",
          "name": "Vincent van Gogh",
          "description": "Dutch post-impressionist painter",
          "birth_year": 1853,
          "death_year": 1890,
          "country": "Netherlands",
          "wikipedia_url": "https://en.wikipedia.org/wiki/Vincent_van_Gogh",
          "date_created": "2024-01-15T10:35:00.000Z",
          "date_updated": "2024-01-15T10:35:00.000Z"
        }
      ],
      "nextToken": "eyJjcmVhdGVkQXQiOiIyMDI0..."
    }
  }
}
```

**Use Cases:**
- **Browse artist directory**: Display a comprehensive list of all artists in the system
- **Data analysis**: Extract complete artist dataset for analytics or machine learning
- **Search functionality**: Build artist search and filtering capabilities
- **Artist discovery**: Help users discover artists they might not know about
- **Data export**: Extract artist data for external systems or backups

**Notes:**
- Returns all artists regardless of whether they have current exhibitions
- Supports pagination for large datasets
- Artists are ordered by creation date (most recent first)
- Each artist includes biographical information when available
- This query is commonly used for data extraction and comprehensive artist listings

### Metadata Queries

#### Get Exhibition Metadata

Get available options for exhibition form fields (event types and exhibition types). This query returns distinct values from the database, useful for populating dropdown fields in submission forms.

**Query:**

```graphql
query GetExhibitionMetadata {
  getExhibitionMetadata {
    eventTypes
    exhibitionTypes
  }
}
```

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| eventTypes | [String!]! | Available event type options (e.g., Exhibition, Biennale, Festival, Art Fair) |
| exhibitionTypes | [String!]! | Available exhibition type/category options (e.g., Solo Exhibition, Group Exhibition, Retrospective) |

**Example Response:**

```json
{
  "data": {
    "getExhibitionMetadata": {
      "eventTypes": [
        "Art Fair",
        "Biennale",
        "Conference",
        "Exhibition",
        "Festival",
        "Triennale"
      ],
      "exhibitionTypes": [
        "Abstract Art Exhibition",
        "Anthological Exhibition",
        "Biennale/Triennial Exhibition",
        "Collective Exhibition",
        "Contemporary Art",
        "Digital Art Exhibition",
        "Drawing Exhibition",
        "Duo Exhibition",
        "Embroidery",
        "Expressionist Exhibition",
        "Graphic Exhibition",
        "Group Exhibition",
        "Impressionist Exhibition",
        "Installation Art Exhibition",
        "Institutional Exhibition",
        "Minimalist Exhibition",
        "Mixed Media Exhibition",
        "Modern Art Exhibition",
        "Museum Exhibition",
        "Painting",
        "Permanent Exhibition",
        "Photography",
        "Pop Art Exhibition",
        "Pottery",
        "Printmaking Exhibition",
        "Religious Art Exhibition",
        "Retrospective Exhibition",
        "Sculpture",
        "Solo Exhibition",
        "Street Art Exhibition",
        "Surrealist Exhibition",
        "Temporary Exhibition",
        "Thematic Exhibition",
        "Video Art Exhibition"
      ]
    }
  }
}
```

**Notes:**
- No variables required
- Results can be cached client-side as they change infrequently
- Values are retrieved dynamically from the database (not hardcoded)
- Event types come from the `eventtype` column in the exhibitions table
- Exhibition types come from the `exhibition_type` JSON array column in the exhibitions table

### User Profile Queries

#### Get a User Profile

Get a single user profile by its ID.

**Query:**

```graphql
query GetUserProfile($id: ID!) {
  getUserProfile(id: $id) {
    id
    status
    firstname
    lastname
    email
    avatar
    appleUserId
    date_created
    date_updated
  }
}
```

**Variables:**

```json
{
  "id": "7e38f7a2-0f3c-4f70-84f1-da22342f44fa"
}
```

#### Get a User Profile by Apple ID

Get a single user profile by Apple user ID. This is useful for Apple Sign-In users when email is not available.

**Query:**

```graphql
query GetUserByAppleId($appleUserId: String!) {
  getUserByAppleId(appleUserId: $appleUserId) {
    id
    status
    firstname
    lastname
    email
    avatar
    appleUserId
    date_created
    date_updated
  }
}
```

**Variables:**

```json
{
  "appleUserId": "000748.848f4e30b1094b03b136e9596e92a383.2056"
}
```

#### Get a User Profile by Firebase UID

Get a single user profile by Firebase user ID. This is useful for Firebase Authentication users.

**Query:**

```graphql
query GetUserByFirebaseUid($firebaseUid: String!) {
  getUserByFirebaseUid(firebaseUid: $firebaseUid) {
    id
    status
    firstname
    lastname
    email
    avatar
    firebaseUid
    date_created
    date_updated
  }
}
```

**Variables:**

```json
{
  "firebaseUid": "firebase_uid_12345"
}
```

#### List User Profiles

Get a list of user profiles with pagination.

**Query:**

```graphql
query ListUserProfiles($limit: Int, $nextToken: String) {
  listUserProfiles(limit: $limit, nextToken: $nextToken) {
    items {
      id
      status
      firstname
      lastname
      email
      avatar
      appleUserId
      date_created
    }
    nextToken
  }
}
```

**Variables:**

```json
{
  "limit": 10,
  "nextToken": null
}
```

### User Favorites Queries

#### Get a User Favorite

Get a single user favorite by its ID.

**Query:**

```graphql
query GetUserFavorite($id: ID!) {
  getUserFavorite(id: $id) {
    id
    userId
    galleryId
    date_created
    date_updated
    gallery {
      id
      galleryname
      placeurl
      fulladdress
    }
  }
}
```

**Variables:**

```json
{
  "id": "abc123"
}
```

#### Get User Gallery Favorites By ID

Get all gallery favorites for a specific user using ID-based access.

**Query:**

```graphql
query GetUserGalleryFavoritesById($userId: ID!, $limit: Int, $nextToken: String) {
  getUserGalleryFavoritesById(userId: $userId, limit: $limit, nextToken: $nextToken) {
    items {
      id
      userId
      galleryId
      targetType
      date_created
      gallery {
        id
        galleryname
        placeurl
        fulladdress
        lat
        lon
        gallery_img_url
      }
    }
    nextToken
  }
}
```

**Variables:**

```json
{
  "userId": "cc84ff794a0dc43b68b0",
  "limit": 10,
  "nextToken": null
}
```

This query specifically returns only gallery-type favorites and includes the complete gallery object with all its fields. It's optimized for applications that need to display a user's gallery favorites with rich details.

#### Get User Exhibition Favorites By ID

Get all exhibition favorites for a specific user using ID-based access.

**Query:**

```graphql
query GetUserExhibitionFavoritesById($userId: ID!, $limit: Int, $nextToken: String) {
  getUserExhibitionFavoritesById(userId: $userId, limit: $limit, nextToken: $nextToken) {
    items {
      id
      userId
      exhibitionId
      targetType
      date_created
      exhibition {
        id
        title
        artist
        description
        galleryname
        gallery_id
        exhibition_img_url
      }
    }
    nextToken
  }
}
```

**Variables:**

```json
{
  "userId": "cc84ff794a0dc43b68b0",
  "limit": 10,
  "nextToken": null
}
```

This query specifically returns only exhibition-type favorites and includes the complete exhibition object with all its fields. It's optimized for applications that need to display a user's exhibition favorites with rich details.

### Get User Profile with Favorites

Get a user profile with their favorited galleries.

**Query:**

```graphql
query UserProfileWithFavorites($id: ID!, $limit: Int) {
  getUserProfile(id: $id) {
    id
    firstname
    lastname
    email
    avatar
    favorites(limit: $limit) {
      items {
        id
        date_created
        gallery {
          id
          galleryname
          fulladdress
          gallery_img_url
        }
      }
      nextToken
    }
  }
}
```

**Variables:**

```json
{
  "id": "7e38f7a2-0f3c-4f70-84f1-da22342f44fa",
  "limit": 5
}
```

### Get Gallery with Users Who Favorited It

Get a gallery with the list of users who have favorited it.

**Query:**

```graphql
query GalleryWithFavorites($id: ID!, $limit: Int) {
  getGalleryById(id: $id) {
    id
    galleryname
    favoritedBy(limit: $limit) {
      items {
        id
        date_created
        user {
          id
          firstname
          lastname
          avatar
        }
      }
      nextToken
    }
  }
}
```

**Variables:**

```json
{
  "id": "1",
  "limit": 5
}
```

## Mutations

### User Profile Mutations

#### Create User Profile

Create a new user profile.

**Mutation:**

```graphql
mutation CreateUserProfile($input: CreateUserProfileInput!) {
  createUserProfile(input: $input) {
    id
    status
    firstname
    lastname
    email
    avatar
    appleUserId
    date_created
    date_updated
  }
}
```

**Variables - Standard Email-based User:**

```json
{
  "input": {
    "id": "6756efe04b0dc688d0cc",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "birthday": "1990-01-15",
    "avatar": "https://example.com/avatar.jpg",
    "status": "published"
  }
}
```

**Variables - Apple Sign-In User with Email:**

```json
{
  "input": {
    "firstname": "Jane",
    "lastname": "Smith",
    "email": "jane.smith@example.com",
    "appleUserId": "000748.848f4e30b1094b03b136e9596e92a383.2056",
    "avatar": "https://example.com/avatar.jpg",
    "status": "published"
  }
}
```

**Variables - Apple Sign-In User without Email:**

```json
{
  "input": {
    "firstname": "Anonymous",
    "lastname": "User",
    "appleUserId": "000748.848f4e30b1094b03b136e9596e92a383.2056",
    "status": "published"
  }
}
```

**Note:** 
- The `id` field is optional. If provided, it will be used as the user's ID (useful for deterministic IDs based on email). If not provided, a UUID will be automatically generated.
- Either `email` or `appleUserId` must be provided for user creation.
- For Apple Sign-In users, `appleUserId` should always be provided to handle future logins when email might be null.
- The `firstname`, `lastname`, and `birthday` fields are optional. If not provided or empty, the backend will assign smart defaults for names ("Art" for firstname, "Enthusiast" for lastname).

#### Update User Profile

Update an existing user profile.

**Mutation:**

```graphql
mutation UpdateUserProfile($id: ID!, $input: UpdateUserProfileInput!) {
  updateUserProfile(id: $id, input: $input) {
    id
    status
    firstname
    lastname
    email
    avatar
    appleUserId
    date_created
    date_updated
  }
}
```

**Variables:**

```json
{
  "id": "7e38f7a2-0f3c-4f70-84f1-da22342f44fa",
  "input": {
    "firstname": "John",
    "lastname": "Smith",
    "email": "john.smith@example.com",
    "appleUserId": "000748.848f4e30b1094b03b136e9596e92a383.2056"
  }
}
```

#### Delete User Profile

Delete a user profile.

**Mutation:**

```graphql
mutation DeleteUserProfile($id: ID!) {
  deleteUserProfile(id: $id) {
    success
    message
  }
}
```

**Variables:**

```json
{
  "id": "7e38f7a2-0f3c-4f70-84f1-da22342f44fa"
}
```

### User Favorites Mutations

#### Add Favorite

Add a gallery or exhibition to a user's favorites.

**Mutation:**

```graphql
mutation AddFavorite($input: AddFavoriteInput!) {
  addFavorite(input: $input) {
    id
    userId
    galleryId
    exhibitionId
    targetType
    date_created
    date_updated
    gallery {
      galleryname
      placeurl
      fulladdress
    }
    exhibition {
      title
      artist
      description
    }
  }
}
```

**Variables - For Gallery Favorite:**

```json
{
  "input": {
    "userId": "7e38f7a2-0f3c-4f70-84f1-da22342f44fa",
    "galleryId": 1,
    "targetType": "gallery"
  }
}
```

**Variables - For Exhibition Favorite:**

```json
{
  "input": {
    "userId": "7e38f7a2-0f3c-4f70-84f1-da22342f44fa",
    "exhibitionId": 5,
    "targetType": "exhibition"
  }
}
```

**Important Notes:**

1. You must provide either `galleryId` or `exhibitionId` based on the `targetType`. The `targetType` defaults to "gallery" if not specified.
2. If a user tries to add a favorite that already exists (same user, gallery/exhibition, and targetType), the API will return the existing favorite record rather than creating a duplicate.
3. The API always returns the favorite record with its unique ID, which you'll need to store if you want to remove the favorite later.

#### Remove Favorite

Remove a gallery or exhibition from a user's favorites.

**Mutation:**

```graphql
mutation RemoveFavorite($id: ID!) {
  removeFavorite(id: $id) {
    success
    message
  }
}
```

**Variables:**

```json
{
  "id": "70"  # This is the favorite's ID, not the gallery or exhibition ID
}
```

**Important Notes:**

1. The `id` parameter must be the ID of the favorite record itself (returned when you added the favorite), not the gallery ID or exhibition ID.
2. After successful deletion, the API returns a success status and message: `{"success": true, "message": "Favorite with ID 70 removed successfully"}`.
3. If the favorite ID doesn't exist, the API will return: `{"success": false, "message": "Favorite with ID not-existing-id not found"}`.

## Working with Dates

The API provides dates in two formats:

1. **ISO-8601 String Format** (e.g., `"2025-05-01T10:00:00Z"`)
   - Field names: `datefrom`, `dateto`, `added`, `updated`
   - Good for displaying to users

2. **Epoch Timestamp Format** (seconds since January 1, 1970)
   - Field names: `datefrom_epoch`, `dateto_epoch`
   - Good for sorting, filtering, and date calculations

The epoch format is particularly useful for mobile apps because:
- It uses less data (integers vs strings)
- It's faster for sorting and comparing dates
- It simplifies date math operations

## Pagination

For queries that return lists (like `listGalleriesById` and `listExhibitionsByGalleryId`), you can use pagination to get results in smaller chunks:

1. First request: Set `limit` to the number of items you want per page (e.g., 10) and `nextToken` to `null`
2. In the response, check if `nextToken` is not null
3. For the next page: Use the same `limit` and set `nextToken` to the value from the previous response
4. Repeat until `nextToken` is null (meaning there are no more pages)

This approach allows you to load data incrementally, which is important for mobile apps to maintain good performance and reduce data usage.

### Pagination Example

**First Request:**

```graphql
query FirstPage {
  listGalleriesById(limit: 10, nextToken: null) {
    items {
      id
      galleryname
      # other fields...
    }
    nextToken  # This might return "abc123"
  }
}
```

**Second Request:**

```graphql
query SecondPage {
  listGalleriesById(limit: 10, nextToken: "abc123") {
    items {
      id
      galleryname
      # other fields...
    }
    nextToken  # This might return "def456" or null if no more pages
  }
}
```

## Filter Options

When using `listGalleriesById`, you can filter results using the `filter` parameter:

### Available Filters

- **country**: Filter galleries by country
  - `eq`: Equal to (exact match)
  - `contains`: Contains the string (case-insensitive)
  - `beginsWith`: Starts with the string

- **city**: Filter galleries by city
  - `eq`: Equal to (exact match)
  - `contains`: Contains the string (case-insensitive)
  - `beginsWith`: Starts with the string

- **galleryname**: Filter galleries by name
  - `eq`: Equal to (exact match)
  - `contains`: Contains the string (case-insensitive)
  - `beginsWith`: Starts with the string

- **fulladdress**: Filter galleries by address
  - `eq`: Equal to (exact match)
  - `contains`: Contains the string (case-insensitive)
  - `beginsWith`: Starts with the string

- **or**: Logical OR operator for combining multiple filters
  - Takes an array of filter objects
  - Each filter in the array is evaluated with OR logic

### Filter Examples

**Filter by Country:**

```json
{
  "filter": {
    "country": {
      "eq": "Japan"
    }
  }
}
```

**Filter by City Contains:**

```json
{
  "filter": {
    "city": {
      "contains": "Tokyo"
    }
  }
}
```

**Combined Filters with AND logic (default):**

```json
{
  "filter": {
    "country": {
      "eq": "Japan"
    },
    "city": {
      "beginsWith": "T"
    }
  }
}
```

**Search across multiple fields with OR logic:**

```json
{
  "filter": {
    "or": [
      { "galleryname": { "contains": "modern" } },
      { "fulladdress": { "contains": "modern" } },
      { "country": { "contains": "modern" } }
    ]
  }
}
```

**Combining AND and OR logic:**

```json
{
  "filter": {
    "country": { "eq": "Japan" },
    "or": [
      { "galleryname": { "contains": "tokyo" } },
      { "fulladdress": { "contains": "tokyo" } }
    ]
  }
}
```

## API Authentication

To access the API, you need to include the following in your requests:

1. **API Endpoint URL**: The GraphQL endpoint URL provided to you

2. **Required Headers**:
   - `Content-Type: application/json` - Specifies that you're sending JSON data
   - `x-api-key: YOUR_API_KEY` - For authentication
   - `x-tenant-id: YOUR_TENANT_ID` - Identifies which tenant's data to access

## React Native Examples

### Basic Setup

First, set up your API configuration in a separate file (e.g., `api-config.js`):

```javascript
// api-config.js
export const API_ENDPOINT = 'YOUR_GRAPHQL_ENDPOINT_URL';
export const API_KEY = 'YOUR_API_KEY';
export const TENANT_ID = 'YOUR_TENANT_ID';

// Helper function for GraphQL requests
export async function executeGraphQL(query, variables = {}) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'x-tenant-id': TENANT_ID,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    
    return result.data;
  } catch (error) {
    console.error('GraphQL request failed:', error);
    throw error;
  }
}
```

### Example 1: List Galleries Screen

```javascript
// GalleryListScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { executeGraphQL } from './api-config';

const LIST_GALLERIES_QUERY = `
  query ListGalleriesById($limit: Int, $nextToken: String) {
    listGalleriesById(limit: $limit, nextToken: $nextToken) {
      items {
        id
        galleryname
        country
        gallery_img_url
        fulladdress
      }
      nextToken
    }
  }
`;

export default function GalleryListScreen() {
  const [galleries, setGalleries] = useState([]);
  const [nextToken, setNextToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGalleries();
  }, []);

  async function loadGalleries() {
    try {
      setLoading(true);
      const result = await executeGraphQL(LIST_GALLERIES_QUERY, {
        limit: 20,
        nextToken: nextToken
      });
      
      const newGalleries = result.listGalleriesById.items;
      
      // If we're loading more (pagination), append to existing list
      if (nextToken) {
        setGalleries([...galleries, ...newGalleries]);
      } else {
        setGalleries(newGalleries);
      }
      
      setNextToken(result.listGalleriesById.nextToken);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function loadMore() {
    if (nextToken && !loading) {
      loadGalleries();
    }
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={galleries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.galleryItem}>
            {item.gallery_img_url && (
              <Image 
                source={{ uri: item.gallery_img_url }} 
                style={styles.image} 
                resizeMode="cover"
              />
            )}
            <View style={styles.textContainer}>
              <Text style={styles.galleryName}>{item.galleryname}</Text>
              <Text style={styles.country}>{item.country}</Text>
              <Text style={styles.address}>{item.fulladdress}</Text>
            </View>
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          nextToken && loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
  galleryItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 5,
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  galleryName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  country: {
    fontSize: 14,
    color: '#666',
  },
  address: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
});
```

### Example 2: Nearby Galleries Screen

```javascript
// NearbyGalleriesScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location'; // Assuming using Expo
import { executeGraphQL } from './api-config';

const NEARBY_GALLERIES_QUERY = `
  query NearbyGalleriesById($latitude: Float!, $longitude: Float!, $radiusInKm: Float!, $limit: Int) {
    nearbyGalleriesById(latitude: $latitude, longitude: $longitude, radiusInKm: $radiusInKm, limit: $limit) {
      items {
        id
        galleryname
        gallery_img_url
        fulladdress
        distanceInKm
      }
    }
  }
`;

export default function NearbyGalleriesScreen() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Get location permission
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          setLoading(false);
          return;
        }

        // Get current location
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        
        // Load nearby galleries
        await loadNearbyGalleries(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    })();
  }, []);

  async function loadNearbyGalleries(latitude, longitude) {
    try {
      setLoading(true);
      const result = await executeGraphQL(NEARBY_GALLERIES_QUERY, {
        latitude,
        longitude,
        radiusInKm: 5,
        limit: 20
      });
      
      setGalleries(result.nearbyGalleriesById.items);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function loadMore() {
    if (nextToken && !loading) {
      loadGalleries();
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Galleries Near You</Text>
      <FlatList
        data={galleries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.galleryItem}>
            <View style={styles.textContainer}>
              <Text style={styles.galleryName}>{item.galleryname}</Text>
              <Text style={styles.address}>{item.fulladdress}</Text>
              <Text style={styles.distance}>{item.distanceInKm.toFixed(1)} km away</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No galleries found nearby</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 15,
    marginHorizontal: 10,
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
  galleryItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  textContainer: {
    flex: 1,
  },
  galleryName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  distance: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});
```

### Example 3: Gallery Detail Screen with Exhibitions

```javascript
// GalleryDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { executeGraphQL } from './api-config';

const GALLERY_DETAIL_QUERY = `
  query GalleryDetail($id: ID!) {
    getGalleryById(id: $id) {
      id
      galleryname
      placeurl
      openinghours
      country
      gallery_img_url
      fulladdress
      lat
      lon
      exhibitions(limit: 10) {
        items {
          id
          title
          artist
          datefrom
          datefrom_epoch
          dateto
          dateto_epoch
          eventtype
          exhibition_type
          description
          exhibition_img_url
        }
        nextToken
      }
    }
  }
`;

export default function GalleryDetailScreen({ route }) {
  const { galleryId } = route.params;
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGalleryDetail();
  }, []);

  async function loadGalleryDetail() {
    try {
      setLoading(true);
      const result = await executeGraphQL(GALLERY_DETAIL_QUERY, {
        id: galleryId
      });
      
      setGallery(result.getGalleryById);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(epochTime) {
    if (!epochTime) return 'N/A';
    const date = new Date(epochTime * 1000);
    return date.toLocaleDateString();
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  if (!gallery) {
    return (
      <View style={styles.centered}>
        <Text>Gallery not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {gallery.gallery_img_url && (
        <Image 
          source={{ uri: gallery.gallery_img_url }} 
          style={styles.headerImage} 
          resizeMode="cover"
        />
      )}
      
      <View style={styles.infoContainer}>
        <Text style={styles.galleryName}>{gallery.galleryname}</Text>
        <Text style={styles.address}>{gallery.fulladdress}</Text>
        <Text style={styles.country}>{gallery.country}</Text>
        
        {gallery.openinghours && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Opening Hours:</Text>
            <Text style={styles.infoValue}>{gallery.openinghours}</Text>
          </View>
        )}
        
        {gallery.placeurl && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Website:</Text>
            <Text style={styles.infoValue}>{gallery.placeurl}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.exhibitionsContainer}>
        <Text style={styles.sectionTitle}>Current & Upcoming Exhibitions</Text>
        
        {gallery.exhibitions.items.length === 0 ? (
          <Text style={styles.noExhibitions}>No exhibitions available</Text>
        ) : (
          <FlatList
            data={gallery.exhibitions.items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.exhibitionItem}>
                {item.exhibition_img_url && (
                  <Image 
                    source={{ uri: item.exhibition_img_url }} 
                    style={styles.exhibitionImage} 
                    resizeMode="cover"
                  />
                )}
                <View style={styles.exhibitionInfo}>
                  <Text style={styles.exhibitionTitle}>{item.title}</Text>
                  {item.artist && <Text style={styles.artist}>By {item.artist}</Text>}
                  <Text style={styles.dates}>
                    {formatDate(item.datefrom_epoch)} - {formatDate(item.dateto_epoch)}
                  </Text>
                  {item.description && (
                    <Text style={styles.description} numberOfLines={3}>
                      {item.description}
                    </Text>
                  )}
                </View>
              </View>
            )}
            scrollEnabled={false} // Disable scrolling since we're in a ScrollView
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
  headerImage: {
    width: '100%',
    height: 200,
  },
  infoContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  galleryName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  address: {
    fontSize: 16,
    color: '#444',
    marginBottom: 5,
  },
  country: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  exhibitionsContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  noExhibitions: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  exhibitionItem: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
  },
  exhibitionImage: {
    width: '100%',
    height: 150,
  },
  exhibitionInfo: {
    padding: 10,
  },
  exhibitionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  artist: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
  },
  dates: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
});
```

### Example 4: Historical Exhibitions Screen

Example of displaying all exhibitions including past ones with full artist relationships:

```javascript
// HistoricalExhibitionsScreen.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { executeGraphQL } from './api-config';

const HISTORICAL_EXHIBITIONS_QUERY = `
  query ListAllHistoricalExhibitions($limit: Int, $nextToken: String) {
    listAllHistoricalExhibitions(limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        artist
        galleryname
        datefrom
        dateto
        datefrom_epoch
        dateto_epoch
        description
        eventtype
        exhibition_img_url
        hasArtistRelationships
        artists {
          id
          display_order
          confidence_score
          artist {
            id
            name
            description
            birth_year
            death_year
            country
          }
        }
      }
      nextToken
    }
  }
`;

export default function HistoricalExhibitionsScreen() {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextToken, setNextToken] = useState(null);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all'); // 'all', 'current', 'past', 'upcoming'

  useEffect(() => {
    loadHistoricalExhibitions();
  }, []);

  async function loadHistoricalExhibitions(isLoadingMore = false) {
    try {
      if (isLoadingMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const result = await executeGraphQL(HISTORICAL_EXHIBITIONS_QUERY, {
        limit: 20,
        nextToken: isLoadingMore ? nextToken : null,
      });

      const newExhibitions = result.listAllHistoricalExhibitions.items;
      
      if (isLoadingMore) {
        setExhibitions(prev => [...prev, ...newExhibitions]);
      } else {
        setExhibitions(newExhibitions);
      }
      
      setNextToken(result.listAllHistoricalExhibitions.nextToken);
    } catch (error) {
      console.error('Error loading historical exhibitions:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  function loadMoreExhibitions() {
    if (nextToken && !loadingMore) {
      loadHistoricalExhibitions(true);
    }
  }

  function getExhibitionStatus(exhibition) {
    const now = Date.now() / 1000; // Current time in epoch seconds
    const startTime = exhibition.datefrom_epoch;
    const endTime = exhibition.dateto_epoch;

    if (!startTime || !endTime) return 'unknown';
    
    if (now < startTime) return 'upcoming';
    if (now > endTime) return 'past';
    return 'current';
  }

  function getStatusColor(status) {
    switch (status) {
      case 'current': return '#4CAF50';
      case 'upcoming': return '#2196F3';
      case 'past': return '#757575';
      default: return '#757575';
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case 'current': return 'CURRENT';
      case 'upcoming': return 'UPCOMING';
      case 'past': return 'PAST';
      default: return 'UNKNOWN';
    }
  }

  function filteredExhibitions() {
    if (selectedTimeFilter === 'all') return exhibitions;
    
    return exhibitions.filter(exhibition => {
      const status = getExhibitionStatus(exhibition);
      return status === selectedTimeFilter;
    });
  }

  function renderTimeFilter() {
    const filters = [
      { key: 'all', label: 'All' },
      { key: 'current', label: 'Current' },
      { key: 'upcoming', label: 'Upcoming' },
      { key: 'past', label: 'Past' },
    ];

    return (
      <View style={styles.filterContainer}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedTimeFilter === filter.key && styles.filterButtonActive
            ]}
            onPress={() => setSelectedTimeFilter(filter.key)}
          >
            <Text style={[
              styles.filterText,
              selectedTimeFilter === filter.key && styles.filterTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  function renderArtists(exhibition) {
    if (exhibition.hasArtistRelationships && exhibition.artists?.length > 0) {
      // Show structured artist data
      const sortedArtists = exhibition.artists
        .sort((a, b) => (a.display_order || 999) - (b.display_order || 999));
      
      return (
        <View style={styles.artistsContainer}>
          {sortedArtists.map((artistRel, index) => (
            <TouchableOpacity 
              key={artistRel.id} 
              style={styles.artistItem}
              onPress={() => showArtistProfile(artistRel.artist)}
            >
              <Text style={styles.artistName}>{artistRel.artist.name}</Text>
              {artistRel.artist.country && (
                <Text style={styles.artistCountry}>({artistRel.artist.country})</Text>
              )}
              {artistRel.artist.birth_year && (
                <Text style={styles.artistYears}>
                  {artistRel.artist.birth_year}
                  {artistRel.artist.death_year ? `-${artistRel.artist.death_year}` : ''}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      );
    } else if (exhibition.artist) {
      // Fall back to legacy string field
      return (
        <Text style={styles.artistLegacy}>{exhibition.artist}</Text>
      );
    }
    return null;
  }

  function showArtistProfile(artist) {
    // Navigate to artist profile screen
    console.log('Show artist profile:', artist);
  }

  function renderExhibition({ item }) {
    const status = getExhibitionStatus(item);
    
    return (
      <TouchableOpacity style={styles.exhibitionCard}>
        <View style={styles.statusBadge}>
          <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
            {getStatusLabel(status)}
          </Text>
        </View>
        
        {item.exhibition_img_url && (
          <Image 
            source={{ uri: item.exhibition_img_url }} 
            style={styles.exhibitionImage}
          />
        )}
        
        <View style={styles.exhibitionInfo}>
          <Text style={styles.exhibitionTitle}>{item.title}</Text>
          <Text style={styles.gallery}>{item.galleryname}</Text>
          
          {renderArtists(item)}
          
          <Text style={styles.dates}>
            {new Date(item.datefrom).toLocaleDateString()} - {new Date(item.dateto).toLocaleDateString()}
          </Text>
          
          {item.eventtype && item.eventtype !== 'Exhibition' && (
            <Text style={styles.eventType}>{item.eventtype}</Text>
          )}
          
          {item.description && (
            <Text style={styles.description} numberOfLines={3}>
              {item.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading historical exhibitions...</Text>
      </View>
    );
  }

  const filteredData = filteredExhibitions();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Exhibition Archive ({exhibitions.length} total)
      </Text>
      
      {renderTimeFilter()}
      
      <FlatList
        data={filteredData}
        renderItem={renderExhibition}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onEndReached={loadMoreExhibitions}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No {selectedTimeFilter === 'all' ? '' : selectedTimeFilter} exhibitions found
          </Text>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#0066CC" />
              <Text>Loading more...</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: '#0066CC',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  exhibitionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  exhibitionImage: {
    width: '100%',
    height: 150,
  },
  exhibitionInfo: {
    padding: 12,
  },
  exhibitionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gallery: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
    marginBottom: 8,
  },
  artistsContainer: {
    marginBottom: 8,
  },
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
    marginRight: 8,
  },
  artistCountry: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  artistYears: {
    fontSize: 12,
    color: '#999',
  },
  artistLegacy: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  dates: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventType: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
```

### Exhibitions with Distance Screen

Example of displaying all exhibitions with distance from user's location:

```javascript
// ExhibitionsWithDistanceScreen.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, Image, Alert } from 'react-native';
import * as Location from 'expo-location';
import { executeGraphQL } from './api-config';

const EXHIBITIONS_WITH_DISTANCE_QUERY = `
  query ListAllExhibitionsWithDistance($limit: Int, $latitude: Float!, $longitude: Float!) {
    listAllExhibitions(limit: $limit, latitude: $latitude, longitude: $longitude) {
      items {
        id
        title
        artist
        galleryname
        datefrom
        dateto
        description
        exhibition_img_url
        distanceInKm
      }
      nextToken
    }
  }
`;

export default function ExhibitionsWithDistanceScreen() {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    loadExhibitionsWithDistance();
  }, []);

  async function loadExhibitionsWithDistance() {
    try {
      // Request location permission and get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Please allow location access to see exhibitions with distance.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Load exhibitions with distance calculation
      const result = await executeGraphQL(EXHIBITIONS_WITH_DISTANCE_QUERY, {
        limit: 20,
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      setExhibitions(result.listAllExhibitions.items);
    } catch (error) {
      console.error('Error loading exhibitions with distance:', error);
      Alert.alert('Error', 'Failed to load exhibitions with distance');
    } finally {
      setLoading(false);
    }
  }

  function renderExhibition({ item }) {
    return (
      <View style={styles.exhibitionCard}>
        {item.exhibition_img_url && (
          <Image 
            source={{ uri: item.exhibition_img_url }} 
            style={styles.exhibitionImage}
          />
        )}
        <View style={styles.exhibitionInfo}>
          <Text style={styles.exhibitionTitle}>{item.title}</Text>
          <Text style={styles.artist}>{item.artist}</Text>
          <Text style={styles.gallery}>{item.galleryname}</Text>
          {item.distanceInKm !== null && (
            <Text style={styles.distance}>
              {item.distanceInKm.toFixed(1)} km away
            </Text>
          )}
          <Text style={styles.dates}>
            {new Date(item.datefrom).toLocaleDateString()} - {new Date(item.dateto).toLocaleDateString()}
          </Text>
          {item.description && (
            <Text style={styles.description} numberOfLines={3}>
              {item.description}
            </Text>
          )}
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading exhibitions with distance...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Exhibitions Near You {location && `(${exhibitions.length} found)`}
      </Text>
      <FlatList
        data={exhibitions}
        renderItem={renderExhibition}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  list: {
    padding: 16,
  },
  exhibitionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  exhibitionImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  exhibitionInfo: {
    padding: 12,
  },
  exhibitionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  gallery: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
    marginBottom: 4,
  },
  distance: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  dates: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
});
```

These examples demonstrate how to implement the most common use cases for the API in a React Native application. They include:

1. A reusable GraphQL client function
2. A gallery list with pagination
3. A nearby galleries screen using device location
4. A detailed gallery view with nested exhibitions
5. **NEW:** An exhibitions screen with distance calculation from user's location

You can adapt these examples to fit your specific application needs.

## Backward Compatibility and Migration

The artist relationship system has been designed to be fully backward compatible with existing implementations. This section explains what has changed and how to migrate to the new features.

### What's New

The API now supports many-to-many artist-exhibition relationships through the following additions:

1. **New Types**:
   - `Artist` - represents an individual artist with biographical information
   - `ExhibitionArtist` - represents the relationship between an artist and an exhibition

2. **New Fields on Exhibition Type**:
   - `artists: [ExhibitionArtist]` - array of artist relationships for the exhibition
   - `hasArtistRelationships: Boolean` - indicates if the exhibition has structured artist data

3. **New Queries**:
   - `getArtist(id: ID!): Artist` - get detailed information about a specific artist
   - `exhibitionsForArtist(artistId: String!): [Exhibition]` - find exhibitions for a specific artist

### Backward Compatibility

**All existing queries and fields continue to work exactly as before.** The original `artist: String` field on the `Exhibition` type is preserved and will continue to return artist names as a string.

#### Migration Strategy

You can migrate to the new artist relationship system gradually:

1. **Phase 1: Continue using existing queries**
   - Your existing GraphQL queries will continue to work unchanged
   - The `artist` field will still return artist names as a string

2. **Phase 2: Check for structured data**
   - Use the `hasArtistRelationships` field to determine if an exhibition has structured artist data
   - Fall back to the `artist` string field when structured data is not available

3. **Phase 3: Full migration**
   - Update your UI to use the new `artists` array when available
   - Implement rich artist profiles and relationships

#### Example Migration Query

```graphql
query ExhibitionWithArtists($id: String!) {
  exhibitionById(id: $id) {
    id
    title
    # Legacy field - always available
    artist
    # New fields - use when hasArtistRelationships is true
    hasArtistRelationships
    artists {
      artist {
        id
        name
        bio
      }
      role
    }
  }
}
```

#### Handling Both Data Types

```javascript
// Example React Native component handling both legacy and new data
const ExhibitionArtists = ({ exhibition }) => {
  if (exhibition.hasArtistRelationships && exhibition.artists?.length > 0) {
    // Use structured artist data
    return (
      <View>
        {exhibition.artists.map((artistRel, index) => (
          <TouchableOpacity key={index} onPress={() => showArtistProfile(artistRel.artist)}>
            <Text style={styles.artistName}>{artistRel.artist.name}</Text>
            {artistRel.role && <Text style={styles.artistRole}>{artistRel.role}</Text>}
          </TouchableOpacity>
        ))}
      </View>
    );
  } else if (exhibition.artist) {
    // Fall back to legacy string field
    return <Text style={styles.artistName}>{exhibition.artist}</Text>;
  }
  return null;
};
```

### Database Schema Notes

The artist relationship system is built on the following PostgreSQL tables:

- `artists` - stores artist information (id, name, bio, birth_year, death_year, nationality, art_movement)
- `exhibitions_artists` - junction table for many-to-many relationships (exhibition_id, artist_id, role)
- `exhibitions` - existing table with preserved `artist` column for backward compatibility

### Performance Considerations

- The new artist fields are optional and only queried when explicitly requested
- The `hasArtistRelationships` field is computed efficiently using EXISTS queries
- No performance impact on existing queries that don't use the new fields

### Support and Troubleshooting

If you encounter any issues during migration:

1. Verify your GraphQL queries are using the correct field names
2. Check that the `hasArtistRelationships` field is true before accessing `artists` array
3. Ensure proper error handling for cases where artist data might not be available
4. Test thoroughly in a development environment before deploying to production

The system has been designed to be safe for immediate deployment without breaking existing functionality.
