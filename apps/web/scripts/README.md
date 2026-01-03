# SEO Generation Scripts

This directory contains scripts for generating SEO-related files for the Art Flaneur website.

## Scripts

### `generateSitemap.ts`
Generates a comprehensive XML sitemap including:
- Static pages (home, about, hubs)
- Reviews from Sanity CMS
- Guides from Sanity CMS
- Artists from GraphQL API
- Exhibitions from GraphQL API
- Galleries from GraphQL API

**Output**: `../public/sitemap.xml`

### `generateRss.ts`
Generates an RSS 2.0 feed for the latest exhibition reviews.

**Output**: `../public/rss.xml`

## Usage

### Quick Start

From the `apps/web` directory:

```bash
# Generate both sitemap and RSS
./generate-seo.sh

# Or using npm
npm run generate:seo

# Or individually
npm run generate:sitemap
npm run generate:rss
```

### Requirements

1. **tsx** must be installed as a dev dependency
2. Environment variables must be set (see below)

### Environment Variables

The scripts read from `.env.local` file:

```env
# Sanity CMS - Required for reviews and guides
VITE_SANITY_PROJECT_ID=your_project_id
VITE_SANITY_DATASET=blog

# GraphQL API - Optional, for exhibitions/galleries/artists
VITE_GRAPHQL_ENDPOINT=https://your-endpoint.appsync-api.region.amazonaws.com/graphql
VITE_GRAPHQL_API_KEY=your_api_key
```

### Graceful Degradation

The scripts handle missing data sources gracefully:

- ✅ Missing Sanity config → Static pages only
- ✅ Missing GraphQL config → Sanity content only
- ✅ No reviews published → Empty (but valid) RSS feed
- ✅ API errors → Warning logged, generation continues

## Integration with Build Process

Add to your build pipeline:

```json
{
  "scripts": {
    "build": "npm run generate:seo && tsc && vite build"
  }
}
```

Or in CI/CD:

```bash
cd apps/web && ./generate-seo.sh && cd ../..
```

## Output Format

### Sitemap
- XML format following sitemaps.org protocol
- Includes lastmod dates, priorities, and changefreq
- Submitted to Google Search Console

### RSS Feed
- RSS 2.0 format with Atom extensions
- Includes article images as enclosures
- Author information for each review
- Suitable for feed readers and aggregators

## Troubleshooting

### "Dataset not found" error
- Check `VITE_SANITY_PROJECT_ID` and `VITE_SANITY_DATASET` are correct
- Verify dataset exists in Sanity Studio

### "Unauthorized" error (GraphQL)
- Check `VITE_GRAPHQL_API_KEY` is set and valid
- Verify endpoint URL is correct

### "ENOENT" error
- Scripts must be run from `apps/web` directory
- Or use `./generate-seo.sh` which handles paths automatically

### Empty sitemap/RSS
- Check if content is published in Sanity
- Verify `publishStatus == "published"` for reviews
- Check GraphQL API returns data

## Development

To modify the scripts:

1. Edit `generateSitemap.ts` or `generateRss.ts`
2. Test locally: `npm run generate:seo`
3. Check output in `public/` directory
4. Validate XML: https://validator.w3.org/

## Links

- [Sitemaps Protocol](https://www.sitemaps.org/)
- [RSS 2.0 Specification](https://www.rssboard.org/rss-specification)
- [Google Search Console](https://search.google.com/search-console)
