# SEO Improvements Summary

## Completed Changes

### 1. ✅ Added SEO & JSON-LD for ArticleView (Reviews)
- **File**: `apps/web/pages/ArticleView.tsx`
- Added `useSeo()` hook with comprehensive metadata
- Implemented Article schema (schema.org) including:
  - Article headline, description, image
  - Author information (Person schema)
  - Publisher (Organization schema)
  - Publication and modification dates
  - Review rating (Rating schema)
  - Exhibition context (ExhibitionEvent schema)
- Unique title and meta description for each review
- Canonical URLs
- OpenGraph type set to "article"

### 2. ✅ Added SEO & JSON-LD for ArtistView
- **File**: `apps/web/pages/ArtistView.tsx`
- Added `useSeo()` hook with Person schema
- Implemented Person schema including:
  - Name, biography, nationality
  - Birth/death dates
  - Artist portrait image
  - List of exhibitions (hasOfferCatalog)
- Dynamic SEO description with artist bio
- OpenGraph type set to "profile"

### 3. ✅ Created RSS Feed Generator
- **File**: `apps/web/scripts/generateRss.ts`
- Generates RSS 2.0 feed with latest 50 reviews
- Includes:
  - Review title, description, link
  - Publication date
  - Author information
  - Featured image (enclosure)
- Output: `apps/web/public/rss.xml`
- Added RSS link to HTML head

### 4. ✅ Improved Sitemap Generator
- **File**: `apps/web/scripts/generateSitemap.ts`
- Comprehensive sitemap including:
  - Static pages (home, about, hubs)
  - Reviews from Sanity
  - Guides from Sanity
  - Artists from GraphQL
  - Exhibitions from GraphQL
  - Galleries from GraphQL
- Proper lastmod dates and priorities
- Output: `apps/web/public/sitemap.xml`

### 5. ✅ Enhanced llms.txt for AI Discovery
- **Files**: 
  - `apps/web/public/llms.txt`
  - `apps/web/public/.well-known/llms.txt`
- Added comprehensive information:
  - Machine-readable resource links (sitemap, RSS, robots)
  - Structured data types used
  - Content update frequency
  - Data quality notes
  - Geographic and temporal data formats
- Corrected note about BrowserRouter (no longer hash-based)

### 6. ✅ Updated HTML Head
- **File**: `apps/web/index.html`
- Added RSS feed link tag

### 7. ✅ Added NPM Scripts
- **File**: `apps/web/package.json`
- `npm run generate:sitemap` - Generate sitemap
- `npm run generate:rss` - Generate RSS feed
- `npm run generate:seo` - Run both generators

## How to Use

### Prerequisites

1. **Install tsx dependency:**
```bash
cd apps/web
npm install -D tsx
```

2. **Environment Variables**: Ensure you have `.env.local` file in `apps/web/` with:
```env
VITE_SANITY_PROJECT_ID=your_project_id
VITE_SANITY_DATASET=blog
VITE_GRAPHQL_ENDPOINT=your_graphql_endpoint
VITE_GRAPHQL_API_KEY=your_api_key
```

### Generate SEO files before deployment:

**Option 1: Using the shell script (recommended)**
```bash
cd apps/web
./generate-seo.sh
```

**Option 2: Using npm directly**
```bash
cd apps/web
npm run generate:seo
```

**Option 3: Run individually**
```bash
npm run generate:sitemap
npm run generate:rss
```

### Add to CI/CD Pipeline

For automated generation on deployment, add to your build script:

```bash
cd apps/web && ./generate-seo.sh && cd ../..
```

Or in your package.json:
```json
{
  "scripts": {
    "build": "npm run generate:seo && tsc && vite build"
  }
}
```

## What's Now Available to Search Engines & AI

### For Google/Bing:
✅ Unique title/description per page
✅ Canonical URLs
✅ OpenGraph/Twitter Cards
✅ Comprehensive sitemap with all content
✅ Clean BrowserRouter URLs
✅ robots.txt allowing indexing

### For AI Models (ChatGPT, Claude, Perplexity):
✅ llms.txt with structured information
✅ RSS feed for latest content
✅ JSON-LD structured data on every page:
  - Article schema for reviews
  - Person schema for artists
  - Event schema for exhibitions
  - Place schema for galleries
  - Organization schema globally

### Schema.org Types Implemented:
- ✅ Organization (site-wide)
- ✅ WebSite (site-wide)
- ✅ SoftwareApplication (mobile app, site-wide)
- ✅ Article (reviews)
- ✅ Person (artists, authors)
- ✅ Event / ExhibitionEvent (exhibitions)
- ✅ Place (galleries)
- ✅ Rating (review ratings)

## Testing Recommendations

1. **Validate Structured Data**: Use Google's Rich Results Test
   - https://search.google.com/test/rich-results

2. **Test RSS Feed**: Validate at W3C Feed Validator
   - https://validator.w3.org/feed/

3. **Check Sitemap**: Submit to Google Search Console
   - https://search.google.com/search-console

4. **Verify Meta Tags**: Use OpenGraph debugger
   - https://developers.facebook.com/tools/debug/

5. **Monitor Indexing**: Track in Google Search Console over time

## Environment Variables Needed

The generators automatically read from your `.env.local` file. Required variables:

```env
# Sanity CMS (required for reviews and guides)
VITE_SANITY_PROJECT_ID=your_project_id
VITE_SANITY_DATASET=production

# GraphQL API (optional, for exhibitions, galleries, artists)
VITE_GRAPHQL_ENDPOINT=https://your-endpoint.appsync-api.region.amazonaws.com/graphql
VITE_GRAPHQL_API_KEY=your_api_key
```

**Note**: The scripts will gracefully skip missing data sources:
- If Sanity is not configured: Only static pages in sitemap
- If GraphQL is not configured: Only Sanity content in sitemap
- If no reviews exist: Empty RSS feed (but valid XML)

## Notes

- RSS feed updates when you run `npm run generate:rss`
- Sitemap updates when you run `npm run generate:sitemap`
- Both should be regenerated on each deployment
- Consider adding these to your CI/CD pipeline
- SEO metadata is applied dynamically by React on each page load
