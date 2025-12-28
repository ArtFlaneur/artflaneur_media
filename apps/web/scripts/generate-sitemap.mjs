import fs from 'node:fs/promises';
import path from 'node:path';

const SITE_ORIGIN = process.env.SITE_ORIGIN || 'https://www.artflaneur.com.au';

const getEnv = (key) => {
  const direct = process.env[key];
  if (direct && String(direct).trim().length) return String(direct).trim();

  // Common fallbacks
  const viteKey = `VITE_${key}`;
  const vite = process.env[viteKey];
  if (vite && String(vite).trim().length) return String(vite).trim();

  return undefined;
};

const SANITY_PROJECT_ID =
  getEnv('SANITY_PROJECT_ID') ||
  getEnv('SANITY_STUDIO_PROJECT_ID') ||
  getEnv('NEXT_PUBLIC_SANITY_PROJECT_ID') ||
  getEnv('PUBLIC_SANITY_PROJECT_ID');

const SANITY_DATASET =
  getEnv('SANITY_DATASET') ||
  getEnv('SANITY_STUDIO_DATASET') ||
  getEnv('NEXT_PUBLIC_SANITY_DATASET') ||
  getEnv('PUBLIC_SANITY_DATASET');

const SANITY_API_VERSION =
  getEnv('SANITY_API_VERSION') ||
  getEnv('NEXT_PUBLIC_SANITY_API_VERSION') ||
  '2024-01-01';

const toIsoDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  // Guard invalid dates
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const xmlEscape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const buildUrlEntry = ({ loc, lastmod, changefreq, priority }) => {
  const parts = ['  <url>'];
  parts.push(`    <loc>${xmlEscape(loc)}</loc>`);
  if (lastmod) parts.push(`    <lastmod>${xmlEscape(lastmod)}</lastmod>`);
  if (changefreq) parts.push(`    <changefreq>${xmlEscape(changefreq)}</changefreq>`);
  if (priority) parts.push(`    <priority>${xmlEscape(priority)}</priority>`);
  parts.push('  </url>');
  return parts.join('\n');
};

const fetchSanity = async (groq) => {
  const encoded = encodeURIComponent(groq);
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encoded}`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Sanity query failed (${response.status}): ${body.slice(0, 500)}`);
  }

  const json = await response.json();
  return json.result;
};

const main = async () => {
  const publicDir = path.resolve(process.cwd(), 'public');
  const outPath = path.join(publicDir, 'sitemap.xml');

  // Always include hub pages.
  const entries = [];

  const hubs = [
    { loc: `${SITE_ORIGIN}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_ORIGIN}/reviews`, changefreq: 'daily', priority: '0.9' },
    { loc: `${SITE_ORIGIN}/exhibitions`, changefreq: 'daily', priority: '0.9' },
    { loc: `${SITE_ORIGIN}/galleries`, changefreq: 'weekly', priority: '0.9' },
    { loc: `${SITE_ORIGIN}/artists`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${SITE_ORIGIN}/guides`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${SITE_ORIGIN}/about`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${SITE_ORIGIN}/mission`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${SITE_ORIGIN}/partners/galleries`, changefreq: 'monthly', priority: '0.4' },
    { loc: `${SITE_ORIGIN}/partners/events`, changefreq: 'monthly', priority: '0.4' },
    { loc: `${SITE_ORIGIN}/privacy`, changefreq: 'yearly', priority: '0.2' },
    { loc: `${SITE_ORIGIN}/terms`, changefreq: 'yearly', priority: '0.2' },
    { loc: `${SITE_ORIGIN}/cookies`, changefreq: 'yearly', priority: '0.2' },
  ];

  hubs.forEach((hub) => entries.push(buildUrlEntry(hub)));

  const canQuerySanity = Boolean(SANITY_PROJECT_ID && SANITY_DATASET);

  if (!canQuerySanity) {
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      '  <!--',
      '    Generated sitemap (minimal mode).',
      '    Missing Sanity env vars; only hub pages are included.',
      '    Set SANITY_PROJECT_ID and SANITY_DATASET in the build environment to include detail pages.',
      '  -->',
      ...entries,
      '</urlset>',
      '',
    ].join('\n');

    await fs.mkdir(publicDir, { recursive: true });
    await fs.writeFile(outPath, xml, 'utf8');
    console.log(`✅ Wrote sitemap (minimal) to ${outPath}`);
    return;
  }

  // Reviews and guides are from Sanity and are safe to include.
  const REVIEWS_GROQ = `*[
    _type == "review"
    && publishStatus == "published"
    && defined(slug.current)
  ]{
    "slug": slug.current,
    "lastmod": coalesce(_updatedAt, publishedAt)
  } | order(lastmod desc)`;

  const GUIDES_GROQ = `*[
    _type == "guide"
    && publishStatus == "published"
    && defined(slug.current)
  ]{
    "slug": slug.current,
    "lastmod": coalesce(_updatedAt, publishedAt)
  } | order(lastmod desc)`;

  const [reviews, guides] = await Promise.all([
    fetchSanity(REVIEWS_GROQ).catch((err) => {
      console.warn('⚠️ Failed to fetch reviews for sitemap:', err.message);
      return [];
    }),
    fetchSanity(GUIDES_GROQ).catch((err) => {
      console.warn('⚠️ Failed to fetch guides for sitemap:', err.message);
      return [];
    }),
  ]);

  const seen = new Set();

  const pushUnique = (loc, lastmod, meta) => {
    if (!loc || seen.has(loc)) return;
    seen.add(loc);
    entries.push(
      buildUrlEntry({
        loc,
        lastmod,
        ...meta,
      }),
    );
  };

  reviews.forEach((r) => {
    const slug = r?.slug;
    if (!slug) return;
    const lastmod = toIsoDate(r?.lastmod);
    pushUnique(`${SITE_ORIGIN}/reviews/${slug}`, lastmod, { changefreq: 'weekly', priority: '0.7' });
  });

  guides.forEach((g) => {
    const slug = g?.slug;
    if (!slug) return;
    const lastmod = toIsoDate(g?.lastmod);
    pushUnique(`${SITE_ORIGIN}/guides/${slug}`, lastmod, { changefreq: 'weekly', priority: '0.8' });
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <!--',
    '    Generated sitemap.',
    '    Note: Public routes use BrowserRouter (clean paths).',
    '    Legacy #/ URLs are redirected client-side for backwards compatibility.',
    '  -->',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');

  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(outPath, xml, 'utf8');
  console.log(`✅ Wrote sitemap to ${outPath} (${entries.length} URLs)`);
};

main().catch((err) => {
  console.error('❌ Sitemap generation failed:', err);
  process.exitCode = 1;
});
