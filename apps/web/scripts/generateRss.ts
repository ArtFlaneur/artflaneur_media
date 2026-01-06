import { createClient } from '@sanity/client';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectId = process.env.VITE_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset = process.env.VITE_SANITY_DATASET || process.env.SANITY_DATASET || 'production';

if (!projectId) {
  console.error('❌ VITE_SANITY_PROJECT_ID not set. Cannot generate RSS feed.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
});

interface Review {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  summary?: string;
  publishedAt: string;
  mainImage?: {
    asset?: {
      url?: string;
    };
  };
  author?: {
    name?: string;
  };
}

const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

async function generateRssFeed() {
  console.log('🔍 Fetching reviews from Sanity...');

  const query = `*[
    _type == "review"
    && publishStatus == "published"
  ] | order(publishedAt desc) [0...50] {
    _id,
    title,
    slug,
    "excerpt": coalesce(summary, excerpt),
    publishedAt,
    mainImage {
      asset->{
        url
      }
    },
    author->{
      name
    }
  }`;

  const reviews = await client.fetch<Review[]>(query);

  console.log(`✅ Found ${reviews.length} published reviews`);

  const baseUrl = 'https://www.artflaneur.com.au';
  const buildDate = new Date().toUTCString();

  const rssItems = reviews
    .map((review) => {
      const link = `${baseUrl}/stories/${review.slug.current}`;
      const pubDate = new Date(review.publishedAt).toUTCString();
      const description = escapeXml(review.excerpt || review.title || '');
      const title = escapeXml(review.title || 'Untitled Review');
      const author = review.author?.name ? escapeXml(review.author.name) : 'Art Flaneur';
      const imageUrl = review.mainImage?.asset?.url;

      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      <author>info@artflaneur.com.au (${author})</author>${
        imageUrl
          ? `
      <enclosure url="${imageUrl}" type="image/jpeg" />`
          : ''
      }
    </item>`;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Art Flaneur - Exhibition Reviews</title>
    <link>${baseUrl}</link>
    <description>Curated exhibition reviews and contemporary art insights from Art Flaneur</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <copyright>Art Flaneur Global Pty Ltd</copyright>
    <managingEditor>info@artflaneur.com.au (Art Flaneur)</managingEditor>
    <webMaster>info@artflaneur.com.au (Art Flaneur)</webMaster>
    <image>
      <url>${baseUrl}/Logo.png</url>
      <title>Art Flaneur</title>
      <link>${baseUrl}</link>
    </image>${rssItems}
  </channel>
</rss>`;

  const outputPath = join(__dirname, '..', 'public', 'rss.xml');
  writeFileSync(outputPath, rss, 'utf-8');

  console.log(`✅ RSS feed generated at ${outputPath}`);
  console.log(`📊 Total reviews in feed: ${reviews.length}`);
}

generateRssFeed().catch((err) => {
  console.error('❌ Error generating RSS feed:', err);
  process.exit(1);
});
