export type SeoInput = {
  title?: string;
  description?: string;
  imageUrl?: string;
  canonicalUrl?: string;
  ogType?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
};

export const DEFAULT_SITE_NAME = 'Art Flaneur';
export const DEFAULT_DESCRIPTION =
  'Art Flaneur - Your curated guide to the contemporary art world. Discover galleries, exhibitions, and artists.';

const ensureMetaTag = (selector: string, create: () => HTMLMetaElement) => {
  const existing = document.head.querySelector<HTMLMetaElement>(selector);
  if (existing) return existing;
  const created = create();
  document.head.appendChild(created);
  return created;
};

const setMetaName = (name: string, content: string) => {
  const tag = ensureMetaTag(`meta[name="${CSS.escape(name)}"]`, () => {
    const el = document.createElement('meta');
    el.setAttribute('name', name);
    return el;
  });
  tag.setAttribute('content', content);
};

const setMetaProperty = (property: string, content: string) => {
  const tag = ensureMetaTag(`meta[property="${CSS.escape(property)}"]`, () => {
    const el = document.createElement('meta');
    el.setAttribute('property', property);
    return el;
  });
  tag.setAttribute('content', content);
};

const setLinkRel = (rel: string, href: string) => {
  const existing = document.head.querySelector<HTMLLinkElement>(`link[rel="${CSS.escape(rel)}"]`);
  const link = existing ?? document.createElement('link');
  link.setAttribute('rel', rel);
  link.setAttribute('href', href);
  if (!existing) document.head.appendChild(link);
};

export const getDefaultCanonicalUrl = (): string => {
  // With BrowserRouter, canonical should be the clean path + query string.
  return `${window.location.origin}${window.location.pathname}${window.location.search}`;
};

const setJsonLd = (id: string, payload: SeoInput['jsonLd']) => {
  const scriptId = `seo-jsonld-${id}`;
  const existing = document.head.querySelector<HTMLScriptElement>(`script#${CSS.escape(scriptId)}`);
  const script = existing ?? document.createElement('script');
  script.id = scriptId;
  script.type = 'application/ld+json';
  script.text = JSON.stringify(payload);
  if (!existing) document.head.appendChild(script);
};

export const applySeo = (input: SeoInput) => {
  const title = input.title?.trim() || `${DEFAULT_SITE_NAME} - Contemporary Art Guide`;
  const description = input.description?.trim() || DEFAULT_DESCRIPTION;
  const canonicalUrl = input.canonicalUrl?.trim() || getDefaultCanonicalUrl();

  document.title = title;

  setMetaName('description', description);

  // Indexing control
  if (input.noIndex) {
    setMetaName('robots', 'noindex,nofollow');
  } else {
    // Set a safe default; let robots.txt handle path-level control.
    setMetaName('robots', 'index,follow');
  }

  // Canonical
  setLinkRel('canonical', canonicalUrl);

  // OpenGraph
  setMetaProperty('og:site_name', DEFAULT_SITE_NAME);
  setMetaProperty('og:title', title);
  setMetaProperty('og:description', description);
  setMetaProperty('og:url', canonicalUrl);
  setMetaProperty('og:type', input.ogType ?? 'website');

  if (input.imageUrl) {
    setMetaProperty('og:image', input.imageUrl);
  }

  // Twitter
  setMetaName('twitter:card', 'summary_large_image');
  setMetaName('twitter:title', title);
  setMetaName('twitter:description', description);
  if (input.imageUrl) {
    setMetaName('twitter:image', input.imageUrl);
  }

  if (input.jsonLd) {
    setJsonLd('primary', input.jsonLd);
  }
};
