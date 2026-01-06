import { createClient } from '@sanity/client';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment from process.env
const projectId = process.env.VITE_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset = process.env.VITE_SANITY_DATASET || process.env.SANITY_DATASET || 'production';
const graphqlEndpoint = process.env.VITE_GRAPHQL_ENDPOINT;
const graphqlApiKey = process.env.VITE_GRAPHQL_API_KEY;

if (!projectId) {
  console.warn('⚠️  VITE_SANITY_PROJECT_ID not set. Sitemap will only include static pages.');
}

const client = projectId ? createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
}) : null;

const GRAPHQL_ENDPOINT = graphqlEndpoint;

interface Review {
  _id: string;
  slug: { current: string };
  publishedAt?: string;
  _updatedAt: string;
}

interface Guide {
  _id: string;
  slug: { current: string };
  _updatedAt: string;
}

interface GraphQLArtist {
  id: string;
  name: string;
  updated_at?: string;
}

interface GraphQLExhibition {
  id: string;
  title: string;
  updated_at?: string;
}

interface GraphQLGallery {
  id: string;
  galleryname: string;
  updated_at?: string;
}

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

async function fetchGraphQL(query: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  if (graphqlApiKey) {
    headers['x-api-key'] = graphqlApiKey;
  }

  const response = await fetch(GRAPHQL_ENDPOINT!, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  return response.json();
}

async function generateSitemap() {
  console.log('🗺️  Generating comprehensive sitemap...');

  const baseUrl = 'https://www.artflaneur.art';
  const now = new Date().toISOString();

  // Static pages
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/stories', priority: '0.9', changefreq: 'daily' },
    { loc: '/exhibitions', priority: '0.9', changefreq: 'daily' },
    { loc: '/galleries', priority: '0.9', changefreq: 'weekly' },
    { loc: '/artists', priority: '0.8', changefreq: 'weekly' },
    { loc: '/guides', priority: '0.8', changefreq: 'weekly' },
    { loc: '/about', priority: '0.5', changefreq: 'monthly' },
    { loc: '/mission', priority: '0.5', changefreq: 'monthly' },
    { loc: '/partners/galleries', priority: '0.6', changefreq: 'monthly' },
  ];

  let urls = staticPages.map(
    (page) => `
  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${now}</lastmod>
  </url>`
  );

  // Fetch reviews from Sanity
  if (client) {
    try {
      console.log('📄 Fetching reviews...');
      const reviewsQuery = `*[
        _type == "review"
        && publishStatus == "published"
        && defined(slug.current)
      ] | order(publishedAt desc) {
        _id,
        slug,
        publishedAt,
        _updatedAt
      }`;
      const reviews = await client.fetch<Review[]>(reviewsQuery);
    console.log(`✅ Found ${reviews.length} reviews`);

    reviews.forEach((review) => {
      const lastmod = review.publishedAt || review._updatedAt;
      urls.push(`
  <url>
    <loc>${baseUrl}/stories/${review.slug.current}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`);
    });
    } catch (err) {
      console.warn('⚠️  Could not fetch reviews:', err);
    }
  }

  // Fetch guides from Sanity
  if (client) {
    try {
    console.log('🗺️  Fetching guides...');
    const guidesQuery = `*[
      _type == "guide"
      && defined(slug.current)
    ] | order(_updatedAt desc) {
      _id,
      slug,
      _updatedAt
    }`;
    const guides = await client.fetch<Guide[]>(guidesQuery);
    console.log(`✅ Found ${guides.length} guides`);

    guides.forEach((guide) => {
      urls.push(`
  <url>
    <loc>${baseUrl}/guides/${guide.slug.current}</loc>
    <lastmod>${guide._updatedAt}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
    });
    } catch (err) {
      console.warn('⚠️  Could not fetch guides:', err);
    }
  }

  // Fetch artists from GraphQL
  if (GRAPHQL_ENDPOINT) {
    try {
    console.log('🎨 Fetching artists...');
    const artistsQuery = `
      query {
        listArtists(limit: 1000) {
          items {
            id
            name
            updated_at
          }
        }
      }
    `;
    const artistsResponse = await fetchGraphQL(artistsQuery);
    const artists: GraphQLArtist[] = artistsResponse.data?.listArtists?.items || [];
    console.log(`✅ Found ${artists.length} artists`);

    artists.forEach((artist) => {
      const slug = `${slugify(artist.name)}-${artist.id}`;
      const lastmod = artist.updated_at || now;
      urls.push(`
  <url>
    <loc>${baseUrl}/artists/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    });
    } catch (err) {
      console.warn('⚠️  Could not fetch artists from GraphQL:', err);
    }
  }

  // Fetch exhibitions from GraphQL
  if (GRAPHQL_ENDPOINT) {
    try {
    console.log('🖼️  Fetching exhibitions...');
    const exhibitionsQuery = `
      query {
        listAllExhibitions(limit: 1000) {
          items {
            id
            title
            updated_at
          }
        }
      }
    `;
    const exhibitionsResponse = await fetchGraphQL(exhibitionsQuery);
    const exhibitions: GraphQLExhibition[] = exhibitionsResponse.data?.listAllExhibitions?.items || [];
    console.log(`✅ Found ${exhibitions.length} exhibitions`);

    exhibitions.forEach((exhibition) => {
      const lastmod = exhibition.updated_at || now;
      urls.push(`
  <url>
    <loc>${baseUrl}/exhibitions/${exhibition.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
    });
    } catch (err) {
      console.warn('⚠️  Could not fetch exhibitions from GraphQL:', err);
    }
  }

  // Fetch galleries from GraphQL
  if (GRAPHQL_ENDPOINT) {
    try {
    console.log('🏛️  Fetching galleries...');
    const galleriesQuery = `
      query {
        listGalleries(limit: 1000) {
          items {
            id
            galleryname
            updated_at
          }
        }
      }
    `;
    const galleriesResponse = await fetchGraphQL(galleriesQuery);
    const galleries: GraphQLGallery[] = galleriesResponse.data?.listGalleries?.items || [];
    console.log(`✅ Found ${galleries.length} galleries`);

    galleries.forEach((gallery) => {
      const slug = `${slugify(gallery.galleryname)}-${gallery.id}`;
      const lastmod = gallery.updated_at || now;
      urls.push(`
  <url>
    <loc>${baseUrl}/galleries/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    });
    } catch (err) {
      console.warn('⚠️  Could not fetch galleries from GraphQL:', err);
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
</urlset>`;

  const outputPath = join(__dirname, '..', 'public', 'sitemap.xml');
  writeFileSync(outputPath, sitemap, 'utf-8');

  console.log(`✅ Sitemap generated at ${outputPath}`);
  console.log(`📊 Total URLs: ${urls.length}`);
}

generateSitemap().catch((err) => {
  console.error('❌ Error generating sitemap:', err);
  process.exit(1);
});
