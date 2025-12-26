# Art Flaneur — SEO, AI Visibility & Discoverability Guide (Web + App)

Last updated: 2025-12-26

This guide is a practical, “do this next” checklist for improving:

- Web SEO (Google/Bing/etc)
- App discoverability (ASO for iOS/Android)
- Visibility in AI assistants and AI-powered search (LLMs, chatbots, “answer engines”)

It is written for the current stack:

- React + Vite SPA (HashRouter)
- Content from GraphQL (galleries, exhibitions, artists) and Sanity (reviews)

If something below conflicts with current product priorities, take the “Minimal viable” path first.

---

## 0) TL;DR (Prioritized)

### P0 — Biggest wins (high impact, usually low effort)

1. Move away from `#/` URLs for public content (or provide server-rendered/SSR snapshots)
   - Hash routing is a known SEO limiter; many crawlers treat hash fragments inconsistently.
2. Ensure every content page has:
   - Unique `<title>`
   - Unique meta description
   - Canonical URL
   - OpenGraph/Twitter tags
3. Add `sitemap.xml` + `robots.txt` at the web root.
4. Add structured data (JSON-LD): `Organization`, `WebSite`, `Article` (reviews), `Event` (exhibitions), `Place` (galleries), `Person` (artists).
5. Improve crawl paths:
   - Link internally from hubs (Reviews/Galleries/Exhibitions/Artists)
   - Avoid “dead end” detail pages without contextual links

### P1 — High ROI for AI visibility

6. Publish a clean “knowledge surface” for crawlers and LLMs:
   - `llms.txt` (a concise index + pointers)
   - An RSS feed for new reviews/exhibitions (optional but strong)
7. Create strong entity pages (one URL per gallery, exhibition, artist) with:
   - Clear headings
   - Facts in plain text (dates, location, website)
   - Schema markup
8. Make your brand entity unambiguous across the web:
   - consistent `Organization` schema
   - consistent app store publisher info
   - consistent social profiles

### P2 — Competitive moat

9. A public “press/media kit” page with:
   - brand description
   - key stats
   - direct download links
   - contact
10. Backlinks and partnerships:
   - galleries, museums, city arts orgs linking back to their listing pages

---

## 1) Current architecture: the single biggest SEO constraint

### HashRouter (`/#/path`) is an SEO handicap

Your web app uses `HashRouter`, which produces URLs like:

- `https://example.com/#/galleries/123`

Many search engines and AI crawlers treat hash fragments as client-side state, not canonical content. Modern Google can sometimes render JS and index SPA content, but:

- it is less reliable
- indexing is slower
- rich snippets/structured data can be missed
- AI answer systems often prefer clean, static, server-rendered sources

**Recommendation**

- Best: switch to `BrowserRouter` with real paths and configure hosting to serve `index.html` for unknown routes.
- If you can’t: introduce SSR/prerender snapshots for key routes (Reviews, Exhibitions, Galleries, Artists) and expose them as real URLs.

**Minimal viable**

- Keep HashRouter for now, but add:
  - `sitemap.xml` that lists canonical non-hash URLs (if you can support them)
  - or add a prerender service for the hash routes (less ideal)

---

## 2) What “good SEO” means for Art Flaneur

You are building a “content + entities” discovery platform. Search engines and AI systems reward:

- authoritative entity pages (galleries, artists)
- timely event pages (exhibitions)
- editorial content (reviews)
- internal linking between them

Your information architecture should look like:

- `/galleries` → `/galleries/:id`
- `/exhibitions` → `/exhibitions/:id`
- `/artists` → `/artists/:id`
- `/reviews` → `/reviews/:id`

And each detail page should link to the others (venue ↔ exhibitions ↔ artists ↔ reviews).

---

## 3) Technical SEO checklist

### 3.1 Titles & meta descriptions (per route)

Every route must set:

- `<title>` (unique and descriptive)
- `<meta name="description">`

Examples:

- Gallery page title: `"{Gallery Name} | Art Flaneur"`
- Exhibition page title: `"{Exhibition Title} at {Gallery Name} | Art Flaneur"`
- Artist page title: `"{Artist Name} | Exhibitions & Reviews | Art Flaneur"`

Descriptions should include:

- city + country
- dates for exhibitions
- what the user can do (discover, plan, save)

**Quality bar**

- avoid duplicate titles/descriptions
- keep titles ~50–60 chars when possible
- descriptions ~140–160 chars (not strict, but good practice)

### 3.2 Canonicals

Add `<link rel="canonical" href="...">` per page.

Rules:

- One canonical per content entity.
- Strip tracking params.
- Ensure consistent trailing slash behavior.

### 3.3 Robots

Add a `robots.txt`:

- Allow indexing of public content
- Disallow admin/dashboard routes
- Point to sitemap

Example sections:

- `Disallow: /gallery-dashboard`
- `Disallow: /admin`

If you keep HashRouter, robots rules are harder because the fragment isn’t sent to the server.

### 3.4 Sitemaps

Generate:

- `sitemap.xml` (URLs for galleries/exhibitions/artists/reviews)
- optionally split into multiple sitemaps (e.g., `sitemap-galleries.xml`, etc.)

Make sure:

- lastmod is set for content that changes
- use stable canonical URLs

### 3.5 Core Web Vitals

Priorities:

- image optimization (proper sizing, compression, lazy-loading)
- avoid layout shift (explicit image dimensions)
- fast initial content paint (server-rendered is ideal)

### 3.6 OpenGraph + Twitter cards

For shareability (and many AI systems ingest OG tags), add:

- `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

### 3.7 Multi-language (if applicable)

If you later add RU/EN:

- add `hreflang`
- keep translations on separate URLs

---

## 4) Structured data (JSON-LD) that matters

AI and search engines increasingly rely on structured data.

### 4.1 Site-level schema

- `Organization` (Art Flaneur Global Pty Ltd)
- `WebSite` + `SearchAction` (site search)

### 4.2 Content schemas

#### Reviews

Use `Article` (or `NewsArticle`) + `author` + `datePublished` + `image`.

#### Exhibitions

Model as `Event`:

- name
- startDate/endDate
- location: `Place` with address + geo if possible
- performer/organizer can reference artists/galleries (where accurate)

#### Galleries

Model as `Place` (or `ArtGallery` subtype if you want):

- name
- address
- geo
- openingHoursSpecification (if available)
- sameAs (website, socials)

#### Artists

Model as `Person`:

- name
- nationality / birth/death years if known
- sameAs (Wikipedia)

**Important**: only mark up what is true and present on the page.

---

## 5) Content strategy for organic search

### 5.1 Build “hub pages”

Hubs make it easier for crawlers and users to navigate, and increase internal link equity.

Create content clusters such as:

- “Galleries in {City}”
- “Current exhibitions in {City}”
- “Best contemporary art galleries in {City}”

Even if the UI is simple, a dedicated page per city is extremely valuable.

### 5.2 Give pages “answerable” text

AI assistants pull short factual answers. Make sure each detail page has:

- one clear H1
- a fact block with:
  - city/country
  - dates
  - venue
  - website
- short summary paragraph (1–3 sentences)

### 5.3 Internal linking rules

- Gallery page should link to:
  - current/future exhibitions
  - past exhibitions
  - related reviews
- Exhibition page should link to:
  - gallery page
  - relevant artist page(s) (when possible)
  - review (if exists)
- Artist page should link to:
  - exhibitions for that artist

---

## 6) Visibility in AI models / AI search

There are three broad “AI discovery” channels:

1. Traditional search engines that use AI snippets (Google/Bing)
2. AI-native search/answer engines (chat-based)
3. LLM training / indexing pipelines that crawl the web (varies by provider)

### 6.1 Make your content crawlable without executing heavy JS

AI systems often:

- do not run full JS
- or run it with stricter budgets than Google

Best approach:

- SSR/prerender entity pages

Minimal approach:

- provide a static HTML snapshot endpoint for:
  - gallery pages
  - exhibition pages
  - artist pages
  - review pages

### 6.2 Add `llms.txt`

Publish `/.well-known/llms.txt` (and/or `/llms.txt`) with:

- what Art Flaneur is
- canonical site URLs
- where to find:
  - sitemap
  - API docs (if public)
  - press kit
  - contact

This is becoming a common convention for AI crawlers to discover “official” resources.

### 6.3 Provide clean, authoritative pages for citations

AI assistants prefer sources that:

- have stable URLs
- have dates and publisher info
- have clear entity naming

For each page type:

- include “Last updated” (if reasonable)
- include publisher identity (Art Flaneur)

### 6.4 Avoid “thin” pages

A page with only a title and an image is hard to rank and hard to cite.

If description is missing, add a fallback summary:

- venue + city + dates

### 6.5 Use consistent entity naming

Across:

- website
- app store listings
- social bios
- press mentions

Make sure “Art Flaneur” is always spelled consistently (including diacritics usage policy).

---

## 7) App discoverability (ASO)

### 7.1 App Store Optimization fundamentals

You want:

- clear subtitle/short description:
  - “Discover contemporary art exhibitions and galleries”
- keyword strategy:
  - “art exhibitions”, “galleries”, “contemporary art”, city names
- strong screenshots:
  - show value in first 2 screenshots

### 7.2 Deep links & web-to-app bridging

- Add deep links from web pages to open the app (if installed)
- Add “smart banner” / install CTA on relevant pages

### 7.3 Consistent landing pages

Create one canonical web landing page:

- `/app` (or `/download`)

With:

- platform links
- feature bullets
- press quotes
- FAQ

---

## 8) Search presence: Google/Bing setup

### 8.1 Google Search Console

- Verify domain
- Submit sitemap(s)
- Monitor coverage and indexing issues

### 8.2 Bing Webmaster Tools

- same as above

### 8.3 Knowledge Panel / brand entity

- Ensure `Organization` schema includes:
  - legal name
  - logo
  - sameAs social profiles

---

## 9) Off-site signals (backlinks & partnerships)

For this product category, backlinks from:

- galleries
- museums
- city art orgs
- event pages

are extremely valuable.

Tactics:

- Provide each gallery a “Claim & update your page” workflow and a shareable “official listing” URL.
- Give galleries a small embed widget (“Find us on Art Flaneur”).

---

## 10) Practical implementation notes for this repo

### 10.1 Short-term tasks (can be done inside the current Vite web app)

- Add route-level SEO tags (title/description/OG/canonical)
- Add structured data injection (JSON-LD) per route
- Add `robots.txt` and `sitemap.xml` in `apps/web/public/`

### 10.2 Medium-term tasks

- Replace HashRouter with BrowserRouter (or SSR)
- Implement server/edge rewrites
- Add prerendering for entity pages

---

## 11) Measuring success

Track:

- Indexed pages count
- impressions/clicks in Search Console
- ranking for:
  - “art galleries {city}”
  - “exhibitions {city}”
  - gallery brand queries
- app store impressions and conversion rate

---

## 12) Recommended next steps (ordered)

1. Decide URL strategy (HashRouter vs real URLs vs SSR/prerender)
2. Add `robots.txt` + `sitemap.xml`
3. Add per-page title/description/canonical/OG tags
4. Add JSON-LD schema for key pages
5. Add `/download` landing page + deep linking plan
6. Create at least 5 city hub pages that link to galleries/exhibitions
7. Start backlink partnership program with galleries
