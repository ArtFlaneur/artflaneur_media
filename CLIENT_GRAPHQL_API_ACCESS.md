# GraphQL API Access Guide

This document explains how to connect to the ArtFlâneur API for gallery and exhibition data retrieval and submission.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Base Endpoint](#1-base-endpoint)
3. [Authentication](#2-authentication)
4. [Request Format](#3-request-format)
5. [Data Types](#4-data-types)
6. [Available Queries](#5-available-queries)
7. [Filtering](#6-filtering)
8. [Working with Dates](#7-working-with-dates)
9. [Pagination](#8-pagination)
10. [Creating and Updating Galleries and Exhibitions (REST API)](#9-creating-galleries-and-exhibitions-rest-api)
11. [Rate Limits](#10-rate-limits)
12. [HTTP Response Codes](#11-http-response-codes)
13. [Error Handling](#12-error-handling)
14. [Support](#13-support)

---

## Getting Started

To access the API, you will need:
1. **API Key** — provided below for GraphQL access
2. **Tenant ID** — `artflaneur`
3. **Firebase Authentication** — required for write operations (creating galleries/exhibitions)

---

## 1. Base Endpoints

| Service | URL | Purpose |
|---------|-----|----------|
| **GraphQL API** | `https://hv2h5zqj65hwvjq7ylemx3ayaa.appsync-api.ap-southeast-2.amazonaws.com/graphql` | Read galleries, exhibitions, artists |
| **Management API** | `https://q3eqftm1mg.execute-api.ap-southeast-2.amazonaws.com/prod/management/submit` | Create galleries and exhibitions |
| **Image Upload API** | `https://q3eqftm1mg.execute-api.ap-southeast-2.amazonaws.com/prod/upload-url` | Get presigned URL for image uploads |

**Region**: `ap-southeast-2` (Sydney, Australia)

## 2. Authentication

### GraphQL API (Read Operations)

| Header | Value | Purpose |
|--------|-------|----------|
| `Content-Type` | `application/json` | GraphQL requests are JSON-encoded |
| `x-api-key` | `<your-graphql-api-key>` | API key for GraphQL access |
| `x-tenant-id` | `artflaneur` | Tenant identifier |

### REST API (Write Operations)

| Header | Value | Purpose |
|--------|-------|----------|
| `Content-Type` | `application/json` | REST requests are JSON-encoded |
| `Authorization` | `Bearer <Firebase ID Token>` | Firebase authentication token |
| `X-Tenant-Id` | `artflaneur` | Tenant identifier |

> **Security note:** The GraphQL API key is for read-only access. Write operations require Firebase authentication, which provides user-level access control.

### Firebase Web Configuration

For web applications that need to authenticate users for write operations, use the following Firebase configuration:

```javascript
// Firebase Web SDK Configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOThOZ-c25MFgXQQoHeGlinnFPfCs9TSg",
  authDomain: "device-streaming-56c6f689.firebaseapp.com",
  projectId: "device-streaming-56c6f689",
  storageBucket: "device-streaming-56c6f689.firebasestorage.app",
  messagingSenderId: "641443564375",
  appId: "1:641443564375:web:8443a6a40e9e4b8eba4c12",
  measurementId: "G-E6J9JQ9JRY"
};
```

| Property | Value | Notes |
|----------|-------|-------|
| `projectId` | `device-streaming-56c6f689` | Firebase project identifier |
| `appId` | `1:641443564375:web:8443a6a40e9e4b8eba4c12` | Web app identifier |
| `messagingSenderId` | `641443564375` | GCM/FCM sender ID |
| `storageBucket` | `device-streaming-56c6f689.firebasestorage.app` | Firebase Storage bucket |
| `authDomain` | `device-streaming-56c6f689.firebaseapp.com` | Auth redirect domain |
| `measurementId` | `G-E6J9JQ9JRY` | Google Analytics measurement ID (optional) |

**Web OAuth Client ID** (for Google Sign-In):
```
641443564375-35ogqc5922vl45h5hsomfpteo891ju1g.apps.googleusercontent.com
```

#### Firebase Web SDK Setup

```javascript
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
```

> **Note:** For available Firebase products, see: https://firebase.google.com/docs/web/setup#available-libraries

#### Getting a Firebase ID Token (Web)

```javascript
// Sign in with Google
const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);

// Get ID token for API calls
const idToken = await result.user.getIdToken();

// Use this token in Authorization header:
// Authorization: Bearer <idToken>
```

## 3. Request Format

- Use HTTP `POST` with a JSON body that includes `query` and optional `variables`.
- All queries follow standard GraphQL conventions.

```json
{
  "query": "query ListGalleries($limit: Int, $nextToken: String) { listGalleriesById(limit: $limit, nextToken: $nextToken) { items { id galleryname country gallery_img_url } nextToken } }",
  "variables": {
    "limit": 20
  }
}
```

## 4. Data Types

### Gallery

Represents an art gallery or exhibition venue.

| Field | Type | Description |
|-------|------|-------------|
| `id` | ID! | Unique identifier for the gallery |
| `galleryname` | String! | Name of the gallery |
| `placeurl` | String | Gallery website URL |
| `openinghours` | String | Opening hours information |
| `specialevent` | String | Special event information |
| `country` | String | Country where the gallery is located |
| `fulladdress` | String | Full street address |
| `lat` | String | Latitude coordinate |
| `lon` | String | Longitude coordinate |
| `gallery_img_url` | String | URL to gallery image |
| `datefrom` | AWSDateTime | Event start date (ISO-8601) |
| `datefrom_epoch` | Int | Event start date (Unix timestamp in seconds) |
| `dateto` | AWSDateTime | Event end date (ISO-8601) |
| `dateto_epoch` | Int | Event end date (Unix timestamp in seconds) |
| `logo_img_url` | String | URL to logo image from current exhibition |
| `eventtype` | String | Event type from current exhibition |
| `distanceInKm` | Float | Distance from query coordinates (only in geospatial queries) |

### Exhibition

Represents an art exhibition at a gallery.

| Field | Type | Description |
|-------|------|-------------|
| `id` | ID! | Unique identifier for the exhibition |
| `gallery_id` | ID! | ID of the parent gallery |
| `galleryname` | String! | Name of the parent gallery |
| `title` | String! | Exhibition title |
| `artist` | String | Artist name(s) as a string |
| `artists` | [ExhibitionArtist!]! | Structured artist data with relationship details |
| `hasArtistRelationships` | Boolean! | Whether structured artist data exists |
| `description` | String | Exhibition description |
| `city` | String | City where exhibition is held |
| `eventtype` | String | Type of event (e.g., "Exhibition", "Biennale", "Festival") |
| `exhibition_type` | AWSJSON | Array of exhibition categories |
| `datefrom` | AWSDateTime | Start date (ISO-8601) |
| `datefrom_epoch` | Int | Start date (Unix timestamp in seconds) |
| `dateto` | AWSDateTime | End date (ISO-8601) |
| `dateto_epoch` | Int | End date (Unix timestamp in seconds) |
| `exhibition_img_url` | String | URL to exhibition image |
| `logo_img_url` | String | URL to exhibition logo |
| `distanceInKm` | Float | Distance from query coordinates (only when lat/lon provided) |

### Artist

Represents an individual artist.

| Field | Type | Description |
|-------|------|-------------|
| `id` | ID! | Unique identifier (UUID) |
| `name` | String! | Artist's name |
| `description` | String | Biographical information |
| `birth_year` | Int | Year of birth |
| `death_year` | Int | Year of death (null if living) |
| `country` | String | Country associated with the artist |
| `wikipedia_url` | String | URL to Wikipedia page |
| `date_created` | AWSDateTime | Record creation timestamp |
| `date_updated` | AWSDateTime | Record last modified timestamp |

### ExhibitionArtist

Represents the relationship between an exhibition and an artist.

| Field | Type | Description |
|-------|------|-------------|
| `id` | ID! | Unique identifier for the relationship |
| `exhibition_id` | ID! | ID of the exhibition |
| `artist` | Artist! | The artist object |
| `display_order` | Int | Display ordering (null = no specific order) |
| `confidence_score` | Float | AI matching confidence (0.0–1.0) |

### ExhibitionMetadata

Available options for exhibition form fields.

| Field | Type | Description |
|-------|------|-------------|
| `eventTypes` | [String!]! | Available event type options |
| `exhibitionTypes` | [String!]! | Available exhibition category options |

### ExhibitionCounts

Counts of exhibitions by temporal status for a specific gallery.

| Field | Type | Description |
|-------|------|-------------|
| `active` | Int! | Exhibitions currently running (started and not yet ended) |
| `upcoming` | Int! | Exhibitions that haven't started yet |
| `past` | Int! | Exhibitions that have already ended |
| `all` | Int! | Total count of all exhibitions |

---

## 5. Available Queries

### Gallery Queries

#### Get Gallery by ID

Retrieve a single gallery by its unique identifier.

```graphql
query GetGalleryById($id: ID!, $includeUnapproved: Boolean) {
  getGalleryById(id: $id, includeUnapproved: $includeUnapproved) {
    id
    galleryname
    placeurl
    openinghours
    country
    fulladdress
    lat
    lon
    gallery_img_url
    datefrom_epoch
    dateto_epoch
    logo_img_url
    eventtype
    allowed
  }
}
```

**Variables:**
```json
{ "id": "1" }
```

**Variables (Including Unapproved Gallery):**
```json
{
  "id": "13921",
  "includeUnapproved": true
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | ID | Yes | The unique database ID of the gallery |
| `includeUnapproved` | Boolean | No | When `true`, returns the gallery even if `allowed` = "no". Defaults to `false` |

#### List Galleries

Retrieve a paginated list of galleries with optional filtering.

```graphql
query ListGalleries($limit: Int, $nextToken: String, $filter: GalleryFilterInput, $includeUnapproved: Boolean) {
  listGalleriesById(limit: $limit, nextToken: $nextToken, filter: $filter, includeUnapproved: $includeUnapproved) {
    items {
      id
      galleryname
      country
      fulladdress
      gallery_img_url
      lat
      lon
      allowed
    }
    nextToken
  }
}
```

**Variables:**
```json
{
  "limit": 20,
  "filter": { "country": { "eq": "Japan" } }
}
```

**Variables (Including Unapproved Galleries):**
```json
{
  "limit": 50,
  "includeUnapproved": true
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | Int | No | Max results per page (default: 50, max: 100) |
| `nextToken` | String | No | Pagination token for next page |
| `filter` | GalleryFilterInput | No | Filter criteria |
| `includeUnapproved` | Boolean | No | When `true`, includes unapproved galleries (where `allowed` = "no"). Defaults to `false` |

#### Find Nearby Galleries

Find galleries within a radius of a geographic point.

```graphql
query NearbyGalleries($latitude: Float!, $longitude: Float!, $radiusInKm: Float!, $limit: Int) {
  nearbyGalleriesById(latitude: $latitude, longitude: $longitude, radiusInKm: $radiusInKm, limit: $limit) {
    items {
      id
      galleryname
      fulladdress
      lat
      lon
      distanceInKm
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

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `latitude` | Float | Yes | Latitude (-90 to 90) |
| `longitude` | Float | Yes | Longitude (-180 to 180) |
| `radiusInKm` | Float | Yes | Search radius in kilometres |
| `limit` | Int | No | Max results per page (default: 50, max: 100) |

---

### Exhibition Queries

#### Get Exhibition by ID

Retrieve a single exhibition by its unique identifier.

```graphql
query GetExhibitionById($id: ID!) {
  getExhibitionById(id: $id) {
    id
    title
    artist
    description
    galleryname
    gallery_id
    datefrom
    datefrom_epoch
    dateto
    dateto_epoch
    eventtype
    exhibition_type
    exhibition_img_url
    logo_img_url
    hasArtistRelationships
    artists {
      display_order
      confidence_score
      artist {
        id
        name
        country
        birth_year
        death_year
      }
    }
  }
}
```

#### List Exhibitions by Gallery

Retrieve all exhibitions for a specific gallery.

```graphql
query ListExhibitionsByGallery($galleryId: ID!, $limit: Int, $nextToken: String) {
  listExhibitionsByGalleryId(galleryId: $galleryId, limit: $limit, nextToken: $nextToken) {
    items {
      id
      title
      artist
      datefrom_epoch
      dateto_epoch
      eventtype
      exhibition_img_url
    }
    nextToken
  }
}
```

**Variables:**
```json
{ "galleryId": "1", "limit": 10 }
```

#### List Historical Exhibitions by Gallery

Retrieve **all** exhibitions (past, current, upcoming) for a specific gallery.

```graphql
query ListHistoricalExhibitionsByGallery($galleryId: ID!, $limit: Int, $nextToken: String) {
  listHistoricalExhibitionsByGalleryId(galleryId: $galleryId, limit: $limit, nextToken: $nextToken) {
    items {
      id
      title
      artist
      datefrom_epoch
      dateto_epoch
      eventtype
      exhibition_img_url
    }
    nextToken
  }
}
```

**When to use:** Prefer `listExhibitionsByGalleryId` for user-facing lists that should exclude past events. Switch to `listHistoricalExhibitionsByGalleryId` for analytics, archival views, or when you need to show the gallery's full history.

#### List Current and Upcoming Exhibitions

Retrieve all exhibitions that have not yet ended (current + upcoming). Optionally include distance calculation.

```graphql
query ListAllExhibitions($limit: Int, $nextToken: String, $latitude: Float, $longitude: Float) {
  listAllExhibitions(limit: $limit, nextToken: $nextToken, latitude: $latitude, longitude: $longitude) {
    items {
      id
      title
      artist
      galleryname
      gallery_id
      city
      datefrom_epoch
      dateto_epoch
      eventtype
      exhibition_img_url
      distanceInKm
    }
    nextToken
  }
}
```

**Variables (without distance):**
```json
{ "limit": 20 }
```

**Variables (with distance):**
```json
{
  "limit": 20,
  "latitude": -37.8136,
  "longitude": 144.9631
}
```

> **Note:** When `latitude` and `longitude` are provided, results include `distanceInKm` and are ordered by distance. Both must be provided together or both omitted.

#### List All Historical Exhibitions

Retrieve **all** exhibitions including past ones. Useful for archival queries or comprehensive searches.

```graphql
query ListHistoricalExhibitions($limit: Int, $nextToken: String) {
  listAllHistoricalExhibitions(limit: $limit, nextToken: $nextToken) {
    items {
      id
      title
      artist
      galleryname
      datefrom_epoch
      dateto_epoch
      eventtype
      exhibition_img_url
    }
    nextToken
  }
}
```

#### List Special Events

Retrieve events that are **not** regular exhibitions (e.g., festivals, biennales, art fairs).

```graphql
query ListSpecialEvents($limit: Int, $nextToken: String) {
  listSpecialEventsById(limit: $limit, nextToken: $nextToken) {
    items {
      id
      title
      galleryname
      eventtype
      datefrom_epoch
      dateto_epoch
      exhibition_img_url
    }
    nextToken
  }
}
```

---

### Artist Queries

#### Get Artist by ID

Retrieve a single artist by their unique identifier.

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

#### List All Artists

Retrieve a paginated list of all artists.

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
    }
    nextToken
  }
}
```

#### Get Exhibitions for an Artist

Retrieve all exhibitions featuring a specific artist.

```graphql
query ExhibitionsForArtist($artistId: String!, $limit: Int, $nextToken: String) {
  exhibitionsForArtist(artistId: $artistId, limit: $limit, nextToken: $nextToken) {
    items {
      id
      title
      galleryname
      datefrom_epoch
      dateto_epoch
      exhibition_img_url
    }
    nextToken
  }
}
```

---

### Metadata Queries

#### Get Exhibition Metadata

Retrieve available options for event types and exhibition categories. Useful for populating dropdown fields.

```graphql
query GetExhibitionMetadata {
  getExhibitionMetadata {
    eventTypes
    exhibitionTypes
  }
}
```

**Example Response:**
```json
{
  "data": {
    "getExhibitionMetadata": {
      "eventTypes": ["Art Fair", "Biennale", "Exhibition", "Festival"],
      "exhibitionTypes": ["Solo Exhibition", "Group Exhibition", "Retrospective", "Photography"]
    }
  }
}
```

#### Get Exhibition Counts

Retrieve counts of exhibitions by temporal status (active, upcoming, past) for a specific gallery. Useful for displaying exhibition statistics on gallery profile pages.

```graphql
query GetExhibitionCounts($galleryId: ID!) {
  getExhibitionCounts(galleryId: $galleryId) {
    active
    upcoming
    past
    all
  }
}
```

**Variables:**
```json
{ "galleryId": "1" }
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `galleryId` | ID | Yes | The unique database ID of the gallery |

**Example Response:**
```json
{
  "data": {
    "getExhibitionCounts": {
      "active": 2,
      "upcoming": 1,
      "past": 45,
      "all": 48
    }
  }
}
```

**Notes:**
- `active`: Exhibitions where start date ≤ today AND end date ≥ today
- `upcoming`: Exhibitions where start date > today
- `past`: Exhibitions where end date < today
- `all`: Sum of active + upcoming + past
- Returns zeros if the gallery has no exhibitions

#### Get All Exhibition Counts

Retrieve aggregate counts of exhibitions across all galleries by temporal status (active, upcoming, past). Useful for displaying platform-wide exhibition statistics.

```graphql
query GetAllExhibitionCounts {
  getAllExhibitionCounts {
    active
    upcoming
    past
    all
  }
}
```

**Variables:** None required

**Example Response:**
```json
{
  "data": {
    "getAllExhibitionCounts": {
      "active": 671,
      "upcoming": 168,
      "past": 4856,
      "all": 5710
    }
  }
}
```

**Notes:**
- `active`: Exhibitions where start date ≤ today AND end date ≥ today
- `upcoming`: Exhibitions where start date > today
- `past`: Exhibitions where end date < today
- `all`: Total count across all galleries
- Only includes exhibitions from approved galleries (`allowed = 'yes'`)

#### Get Gallery Count

Retrieve the total number of galleries in the platform. Useful for summary widgets or pagination logic when showing gallery-level listings.

```graphql
query GetGalleryCount {
  getGalleryCount {
    total
  }
}
```

**Variables:** None required

**Example Response:**
```json
{
  "data": {
    "getGalleryCount": {
      "total": 11006
    }
  }
}
```

**Notes:**
- `total`: Total number of all galleries in the database
- Helpful for building "All galleries" metrics or list headers

---

## 6. Filtering

The `listGalleriesById` query supports filtering via the `filter` parameter.

### Available Filter Fields

| Field | Operators | Description |
|-------|-----------|-------------|
| `country` | `eq`, `contains`, `beginsWith` | Filter by country |
| `city` | `eq`, `contains`, `beginsWith` | Filter by city |
| `galleryname` | `eq`, `contains`, `beginsWith` | Filter by gallery name |
| `fulladdress` | `eq`, `contains`, `beginsWith` | Filter by address |

### Filter Operators

| Operator | Description |
|----------|-------------|
| `eq` | Exact match (case-sensitive) |
| `contains` | Substring match (case-insensitive) |
| `beginsWith` | Prefix match |

### Combining Filters

**AND Logic** (default): Multiple fields are combined with AND.

```json
{
  "filter": {
    "country": { "eq": "Japan" },
    "city": { "beginsWith": "T" }
  }
}
```

**OR Logic**: Use the `or` array to combine conditions with OR.

```json
{
  "filter": {
    "or": [
      { "galleryname": { "contains": "modern" } },
      { "fulladdress": { "contains": "modern" } }
    ]
  }
}
```

**Combined AND + OR**:

```json
{
  "filter": {
    "country": { "eq": "Japan" },
    "or": [
      { "galleryname": { "contains": "tokyo" } },
      { "city": { "contains": "tokyo" } }
    ]
  }
}
```

---

## 7. Working with Dates

The API provides dates in two formats for flexibility:

| Format | Fields | Use Case |
|--------|--------|----------|
| **ISO-8601** | `datefrom`, `dateto` | Human-readable display |
| **Unix Epoch** | `datefrom_epoch`, `dateto_epoch` | Sorting, filtering, calculations |

### ISO-8601 Format

```
"2025-05-01T10:00:00Z"
```

### Unix Epoch Format

Seconds since January 1, 1970 UTC.

```
1746093600
```

### Converting Epoch to Date

**JavaScript:**
```javascript
const date = new Date(datefrom_epoch * 1000);
```

**Python:**
```python
from datetime import datetime
date = datetime.utcfromtimestamp(datefrom_epoch)
```

> **Recommendation:** Use epoch timestamps for sorting and date arithmetic. Use ISO-8601 for display purposes.

---

## 8. Pagination

## 8. Pagination

All list queries return paginated results using cursor-based pagination.

### Response Structure

```json
{
  "data": {
    "listGalleriesById": {
      "items": [ /* array of results */ ],
      "nextToken": "eyJjcmVhdGVkQXQiOi..."
    }
  }
}
```

### Pagination Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | Int | 50 | Number of items per page (max: 100) |
| `nextToken` | String | null | Cursor for the next page |

### Pagination Flow

1. **First request:** Set `limit` to desired page size, omit `nextToken`
2. **Check response:** If `nextToken` is not `null`, more pages exist
3. **Next page:** Pass the returned `nextToken` value to fetch the next page
4. **End:** When `nextToken` is `null`, all results have been retrieved

### Example

**First Page:**
```graphql
query {
  listGalleriesById(limit: 10) {
    items { id galleryname }
    nextToken
  }
}
```

**Next Page:**
```graphql
query {
  listGalleriesById(limit: 10, nextToken: "eyJjcmVhdGVkQXQiOi...") {
    items { id galleryname }
    nextToken
  }
}
```

---

## 9. Creating and Updating Galleries and Exhibitions (REST API)

To create or update galleries and exhibitions, use the REST API endpoint. This is separate from the GraphQL read API.

### Endpoint

```
POST https://q3eqftm1mg.execute-api.ap-southeast-2.amazonaws.com/prod/management/submit
```

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <Firebase ID Token>` |
| `Content-Type` | Yes | `application/json` |
| `X-Tenant-Id` | Yes | `artflaneur` |
| `X-Session-Id` | No | For logging/tracing |

### Create a Gallery

**Request Body:**

```json
{
  "mode": "gallery",
  "galleryName": "Modern Art Gallery",
  "address": "123 Art Street, Shibuya",
  "country": "Japan",
  "city": "Tokyo",
  "website": "https://example.com",
  "openingHours": "Tue-Sun 10:00-18:00",
  "startDate": "01-03-2024",
  "endDate": "31-12-2024"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `mode` | Yes | Must be `"gallery"` |
| `galleryName` | Yes | Gallery name |
| `address` | Yes | Full street address (automatically geocoded to lat/lon) |
| `country` | Yes | Country name |
| `city` | Yes | City name |
| `website` | No | URL starting with `http://` or `https://` |
| `openingHours` | No | Free text |
| `startDate` | No | Format: `DD-MM-YYYY` |
| `endDate` | No | Format: `DD-MM-YYYY` |

**Success Response:**

```json
{
  "status": "success",
  "data": {
    "galleryId": 12864,
    "message": "Gallery 'Modern Art Gallery' created successfully"
  }
}
```

#### Duplicate Check Workflow (Required)

Before calling `/management/submit` for a new gallery or while selecting the gallery context for a new exhibition, always run a duplicate search that includes unapproved galleries. This prevents teams from recreating galleries that are still pending review.

1. Call `listGalleriesById` with `includeUnapproved: true` and a name/city filter that matches the submission.
2. If any gallery records (approved or `allowed = "no"`) are returned, investigate before creating another record.
3. Only proceed with creation when you have confirmed no duplicates exist.

```graphql
query CheckGalleryDuplicates($galleryName: String!, $city: String) {
  listGalleriesById(
    limit: 5
    includeUnapproved: true
    filter: {
      galleryname: { eq: $galleryName }
      city: { eq: $city }
    }
  ) {
    items {
      id
      galleryname
      city
      allowed
    }
  }
}
```

**Sample Variables:**

```json
{
  "galleryName": "Modern Art Gallery",
  "city": "Tokyo"
}
```

The `allowed` field indicates whether an existing record is already approved; seeing `no` means the gallery is pending but still counts as a duplicate and should not be recreated.

### Create an Exhibition

**Request Body:**

```json
{
  "mode": "exhibition",
  "galleryName": "Modern Art Gallery",
  "title": "Contemporary Visions",
  "artistName": "Yayoi Kusama",
  "description": "A retrospective of contemporary works...",
  "eventType": "Exhibition",
  "exhibitionType": "Solo Exhibition",
  "startDate": "15-01-2025",
  "endDate": "15-04-2025"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `mode` | Yes | Must be `"exhibition"` |
| `galleryName` | Yes | Must match an existing gallery name |
| `title` | Yes | Exhibition title |
| `artistName` | Yes | Artist name(s) |
| `description` | No | Exhibition description |
| `eventType` | No | `Exhibition`, `Biennale`, `Triennale`, `Festival`, `Art Fair`, `Conference` |
| `exhibitionType` | No | `Solo Exhibition`, `Duo Exhibition`, `Group Exhibition`, etc. |
| `startDate` | No | Format: `DD-MM-YYYY` |
| `endDate` | No | Format: `DD-MM-YYYY` |

> **Note:** Use the `getExhibitionMetadata` GraphQL query to retrieve valid `eventType` and `exhibitionType` values.

**Success Response:**

```json
{
  "status": "success",
  "data": {
    "exhibitionId": 10193,
    "message": "Exhibition 'Contemporary Visions' created successfully at Modern Art Gallery"
  }
}
```

### Update a Gallery

**Request Body:**

```json
{
  "mode": "update_gallery",
  "galleryId": 12864,
  "galleryName": "Updated Gallery Name",
  "address": "456 New Street, Shibuya",
  "country": "Japan",
  "city": "Tokyo",
  "website": "https://updated-example.com",
  "openingHours": "Mon-Sun 9:00-17:00",
  "startDate": "01-03-2024",
  "endDate": "31-12-2024"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `mode` | Yes | Must be `"update_gallery"` |
| `galleryId` | Yes | ID of the gallery to update |
| `galleryName` | No | Updated gallery name |
| `address` | No | Updated street address (will re-geocode lat/lon) |
| `country` | No | Updated country name |
| `city` | No | Updated city name |
| `website` | No | Updated URL starting with `http://` or `https://` |
| `openingHours` | No | Updated opening hours (free text) |
| `startDate` | No | Format: `DD-MM-YYYY` |
| `endDate` | No | Format: `DD-MM-YYYY` |

> **Note:** At least one field (besides `mode` and `galleryId`) must be provided to update.

**Success Response:**

```json
{
  "status": "success",
  "data": {
    "galleryId": 12864,
    "message": "Gallery 'Updated Gallery Name' updated successfully. Modified fields: galleryname, openinghours"
  }
}
```

### Update an Exhibition

**Request Body:**

```json
{
  "mode": "update_exhibition",
  "exhibitionId": 10193,
  "title": "Updated Exhibition Title",
  "artistName": "New Artist Name",
  "description": "Updated description of the exhibition...",
  "eventType": "Exhibition",
  "exhibitionType": ["Solo Exhibition", "Retrospective"],
  "startDate": "15-01-2025",
  "endDate": "15-06-2025"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `mode` | Yes | Must be `"update_exhibition"` |
| `exhibitionId` | Yes | ID of the exhibition to update |
| `title` | No | Updated exhibition title |
| `artistName` | No | Updated artist name(s) |
| `description` | No | Updated exhibition description |
| `eventType` | No | `Exhibition`, `Biennale`, `Triennale`, `Festival`, `Art Fair`, `Conference` |
| `exhibitionType` | No | Array of categories: `Solo Exhibition`, `Group Exhibition`, etc. |
| `startDate` | No | Format: `DD-MM-YYYY` |
| `endDate` | No | Format: `DD-MM-YYYY` |

> **Note:** At least one field (besides `mode` and `exhibitionId`) must be provided to update. Date validation ensures `startDate` is before `endDate`.

**Success Response:**

```json
{
  "status": "success",
  "data": {
    "exhibitionId": 10193,
    "message": "Exhibition 'Updated Exhibition Title' updated successfully. Modified fields: title, artistName, startDate"
  }
}
```

### Error Responses

**400 Bad Request** — Validation error:
```json
{
  "status": "error",
  "error": "Missing required field: galleryName"
}
```

**400 Bad Request** — Entity not found (for updates):
```json
{
  "status": "error",
  "error": "Gallery with ID 99999 not found"
}
```

**400 Bad Request** — No fields to update:
```json
{
  "status": "error",
  "error": "No fields to update. Provide at least one field to modify."
}
```

**400 Bad Request** — Gallery not found (for exhibitions):
```json
{
  "status": "error",
  "error": "Gallery 'Unknown Gallery' not found. Please create the gallery first."
}
```

**400 Bad Request** — Duplicate detected:
```json
{
  "status": "error",
  "error": "Gallery 'Modern Art Gallery' already exists in Japan (ID: 45)"
}
```

**400 Bad Request** — Invalid date range:
```json
{
  "status": "error",
  "error": "Start date must be before end date"
}
```

**401 Unauthorized:**
```json
{
  "status": "error",
  "error": "Invalid or missing authentication token"
}
```

### Image Upload Workflow

Images are uploaded **after** the gallery or exhibition is created using the `/upload-url` endpoint.

#### Step 1: Create the Gallery or Exhibition

Submit form data to `/management/submit` and receive the entity ID.

#### Step 2: Request a Presigned Upload URL

```
POST https://q3eqftm1mg.execute-api.ap-southeast-2.amazonaws.com/prod/upload-url
```

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <Firebase ID Token>` |
| `Content-Type` | Yes | `application/json` |
| `X-Tenant-Id` | Yes | `artflaneur` |

**Request Body:**
```json
{
  "entityType": "gallery",
  "entityId": 12864,
  "filename": "gallery-photo.jpg",
  "contentType": "image/jpeg"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `entityType` | Yes | `"gallery"` or `"exhibition"` |
| `entityId` | Yes | The ID returned from `/management/submit` |
| `filename` | Yes | Original filename |
| `contentType` | Yes | MIME type (e.g., `image/jpeg`, `image/png`) |

**Response:**
```json
{
  "uploadUrl": "https://s3.ap-southeast-2.amazonaws.com/...",
  "key": "uploads/gallery/12864/gallery-photo.jpg"
}
```

#### Step 3: Upload the Image to S3

Use the presigned `uploadUrl` to upload the image directly to S3:

```bash
curl -X PUT \
  "<uploadUrl from response>" \
  -H "Content-Type: image/jpeg" \
  --data-binary @gallery-photo.jpg
```

The image is automatically processed and linked to the entity.

### Important: No Static API Key for Uploads

> **Security Note:** Image uploads do **NOT** use a static API key. The authentication flow is:
>
> 1. **Step 1**: Authenticate with Firebase and obtain a Firebase ID Token
> 2. **Step 2**: POST to `/upload-url` with the Firebase ID Token in the `Authorization` header
> 3. **Step 3**: Receive a time-limited presigned S3 URL (valid for **15 minutes / 900 seconds**)
> 4. **Step 4**: PUT the image directly to S3 using the presigned URL (no additional authentication needed — credentials are embedded in the URL itself)
>
> This two-step presigned URL approach provides several security benefits:
> - No long-lived API keys that could be compromised
> - Each upload URL is unique and expires quickly
> - Server validates user permissions before generating upload URLs
> - Direct S3 upload reduces server load and improves performance

### Sample cURL — Create Gallery

```bash
curl -X POST \
  "https://q3eqftm1mg.execute-api.ap-southeast-2.amazonaws.com/prod/management/submit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
  -H "X-Tenant-Id: artflaneur" \
  -d '{
    "mode": "gallery",
    "galleryName": "Modern Art Gallery",
    "address": "123 Art Street, Shibuya",
    "country": "Japan",
    "city": "Tokyo"
  }'
```

---

## 10. Rate Limits

| Limit Type | Value |
|------------|-------|
| Sustained | 100 requests/second |
| Burst | 200 requests |

If you require higher throughput, contact support to discuss your requirements before scaling usage.

---

## 11. HTTP Response Codes

| Code | Meaning |
|------|---------|
| `200` | Success — check `data` and `errors` fields in response body |
| `400` | Bad Request — malformed query or invalid variables |
| `401` | Unauthorized — missing or invalid API key or token |
| `403` | Forbidden — valid key but insufficient permissions |
| `429` | Too Many Requests — rate limit exceeded |
| `500` | Internal Server Error — retry with exponential backoff |

---

## 12. Error Handling

### GraphQL Response Structure

GraphQL responses always include both `data` and `errors` fields:

```json
{
  "data": null,
  "errors": [
    {
      "message": "Unauthorized",
      "errorType": "UnauthorizedException",
      "path": ["listGalleriesById"]
    }
  ]
}
```

### REST API Response Structure

REST responses use the `status` field:

```json
{
  "status": "error",
  "error": "Missing required field: galleryName"
}
```

### Common Error Types

| Error | Cause | Resolution |
|-------|-------|------------|
| `UnauthorizedException` | Missing or invalid API key | Check `x-api-key` header |
| `Unauthorized` | Missing tenant ID or invalid token | Check `x-tenant-id` or `Authorization` header |
| `ValidationError` | Invalid query or variables | Review query syntax and variable types |

### Best Practices

1. Always check the `errors` array in GraphQL responses
2. Always check the `status` field in REST responses
3. Implement exponential backoff for `429` and `500` errors
4. Log error details for debugging

---

## Quick Reference: Sample cURL Request (GraphQL)

```bash
curl -X POST \
  https://your-appsync-endpoint.appsync-api.region.amazonaws.com/graphql \
  -H "Content-Type: application/json" \
  -H "x-api-key: <your-graphql-api-key>" \
  -H "x-tenant-id: artflaneur" \
  -d '{
    "query": "query { listGalleriesById(limit: 10) { items { id galleryname country } nextToken } }"
  }'
```

---

## Quick Reference: JavaScript Client

```javascript
// GraphQL Client (for reading data)
const GRAPHQL_ENDPOINT = 'https://your-appsync-endpoint.appsync-api.region.amazonaws.com/graphql';
const API_KEY = '<your-graphql-api-key>';
const TENANT_ID = 'artflaneur';

async function executeGraphQL(query, variables = {}) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'x-tenant-id': TENANT_ID,
    },
    body: JSON.stringify({ query, variables })
  });

  const payload = await response.json();
  
  if (payload.errors?.length) {
    throw new Error(payload.errors[0].message);
  }
  
  return payload.data;
}

// REST Client (for creating galleries/exhibitions)
const REST_ENDPOINT = 'https://q3eqftm1mg.execute-api.ap-southeast-2.amazonaws.com/prod';

async function submitGalleryOrExhibition(data, firebaseToken) {
  const response = await fetch(`${REST_ENDPOINT}/management/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${firebaseToken}`,
      'X-Tenant-Id': 'artflaneur',
    },
    body: JSON.stringify(data)
  });

  const payload = await response.json();
  
  if (payload.status === 'error') {
    throw new Error(payload.error);
  }
  
  return payload.data;
}

// Image Upload Client
async function getUploadUrl(entityType, entityId, filename, contentType, firebaseToken) {
  const response = await fetch(`${REST_ENDPOINT}/upload-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${firebaseToken}`,
      'X-Tenant-Id': 'artflaneur',
    },
    body: JSON.stringify({ entityType, entityId, filename, contentType })
  });

  const payload = await response.json();
  return payload;
}

async function uploadImage(uploadUrl, file, contentType) {
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file
  });
}

// ===========================================
// USAGE EXAMPLES
// ===========================================

// Example 1: Read galleries (no auth required)
const galleries = await executeGraphQL(`
  query ListGalleries($limit: Int) {
    listGalleriesById(limit: $limit) {
      items { id galleryname country gallery_img_url }
      nextToken
    }
  }
`, { limit: 20 });

// Example 2: Create a gallery (requires Firebase auth)
const newGallery = await submitGalleryOrExhibition({
  mode: 'gallery',
  galleryName: 'Modern Art Gallery',
  address: '123 Art Street, Shibuya',
  country: 'Japan',
  city: 'Tokyo'
}, firebaseIdToken);

console.log(`Created gallery ID: ${newGallery.galleryId}`);

// Example 3: Upload an image for the new gallery
const { uploadUrl } = await getUploadUrl(
  'gallery',
  newGallery.galleryId,
  'gallery-photo.jpg',
  'image/jpeg',
  firebaseIdToken
);

await uploadImage(uploadUrl, imageFile, 'image/jpeg');
console.log('Image uploaded successfully');

// Example 4: Update a gallery (requires Firebase auth)
const updatedGallery = await submitGalleryOrExhibition({
  mode: 'update_gallery',
  galleryId: 12864,
  openingHours: 'Mon-Sun 10:00-18:00',
  website: 'https://new-website.com'
}, firebaseIdToken);

console.log(updatedGallery.message);

// Example 5: Update an exhibition (requires Firebase auth)
const updatedExhibition = await submitGalleryOrExhibition({
  mode: 'update_exhibition',
  exhibitionId: 10193,
  description: 'Updated exhibition description',
  endDate: '31-12-2025'
}, firebaseIdToken);

console.log(updatedExhibition.message);
```

---

## Assets & Media

Image fields (`gallery_img_url`, `exhibition_img_url`, `logo_img_url`) return paths relative to the CDN. The full image URL format is:

```
https://assets.artflaneur.com.au/directus_uploads/<path_from_api>
```

### Secure Image Loading (Web Applications)

The CDN `assets.artflaneur.com.au` requires a JWT token in the `Authorization` header. Standard HTML `<img>` tags cannot send custom headers, so attempting to load images directly will result in **401 Unauthorized**.

#### Step 1: Obtain a JWT Token

Call this endpoint to get an access token:

```
GET https://hgito8qnb0.execute-api.ap-southeast-2.amazonaws.com/dev/token
```

**No authentication required.** This is a public endpoint. Send a simple GET request:

```javascript
const response = await fetch('https://hgito8qnb0.execute-api.ap-southeast-2.amazonaws.com/dev/token', {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});
const { accessToken } = await response.json();
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

The token is valid for approximately **5 minutes** and can be reused for multiple image requests during that window.

#### Step 2: Fetch Images with the Token

Instead of setting `<img src="...">` directly, use JavaScript `fetch()` to download the image with authentication, then convert to a blob URL:

```javascript
async function loadSecureImage(imagePath, accessToken) {
  const imageUrl = `https://assets.artflaneur.com.au/directus_uploads/${imagePath}`;
  
  const response = await fetch(imageUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Image fetch failed: ${response.status}`);
  }
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// Usage
const blobUrl = await loadSecureImage('galleries/12864/photo.jpg', accessToken);
document.getElementById('myImage').src = blobUrl;
```

#### Architecture Recommendations

1. **Token Caching**: Store the token in memory and reuse it until it expires. Parse the JWT to extract the `exp` claim and refresh ~30 seconds before expiry.

2. **Image Caching**: Once an image is converted to an Object URL, cache it (in memory or IndexedDB) to avoid re-fetching.

3. **Component Abstraction**: Create a reusable component (React, Vue, etc.) that handles the token + fetch + blob conversion internally.

4. **Error Handling**: If an image fetch returns 401, clear the cached token and retry with a fresh one.

#### Complete Example: React SecureImage Component

```javascript
// Token management
let cachedToken = null;
let tokenExpiry = 0;

async function getToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry - 30000) {
    return cachedToken;
  }
  
  const response = await fetch('https://hgito8qnb0.execute-api.ap-southeast-2.amazonaws.com/dev/token');
  const { accessToken } = await response.json();
  
  // Parse JWT expiry
  const payload = JSON.parse(atob(accessToken.split('.')[1]));
  tokenExpiry = payload.exp * 1000;
  cachedToken = accessToken;
  
  return accessToken;
}

// React component
function SecureImage({ path, alt, ...props }) {
  const [src, setSrc] = useState(null);
  
  useEffect(() => {
    let objectUrl = null;
    
    async function loadImage() {
      const token = await getToken();
      const response = await fetch(
        `https://assets.artflaneur.com.au/directus_uploads/${path}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const blob = await response.blob();
      objectUrl = URL.createObjectURL(blob);
      setSrc(objectUrl);
    }
    
    loadImage();
    
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);
  
  if (!src) return <div>Loading...</div>;
  return <img src={src} alt={alt} {...props} />;
}
```

---

## API Versioning

- The API follows semantic versioning
- Breaking changes are communicated at least **30 days** in advance
- Deprecation notices appear in the `extensions` field when applicable
- Subscribe to the API changelog to stay informed

---

## 13. Support

| Channel | Contact |
|---------|---------|
| Technical Support | api-support@artflaneur.com.au |
| Access Requests | api-access@artflaneur.com.au |

---

## Terms of Use

By using this API, you agree to:

- Use data only for the purposes stated in your access request
- Not redistribute raw data without authorisation
- Comply with applicable data protection regulations
- Not attempt to circumvent rate limits or security measures

For full terms, see the API Terms of Service provided with your credentials.


