import { useEffect } from 'react';

import { applySeo, type SeoInput } from './seo';

export const useSeo = (input: SeoInput) => {
  useEffect(() => {
    applySeo(input);
  }, [
    input.title,
    input.description,
    input.imageUrl,
    input.canonicalUrl,
    input.noIndex,
    // JSON-LD can be large; stringify for stable dependency.
    JSON.stringify(input.jsonLd ?? null),
  ]);
};
