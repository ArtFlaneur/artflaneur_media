import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { DEFAULT_SITE_NAME, DEFAULT_DESCRIPTION, getDefaultCanonicalUrl } from '../lib/seo';
import { useSeo } from '../lib/useSeo';

const SiteSeo: React.FC = () => {
  const location = useLocation();

  const canonicalUrl = useMemo(() => getDefaultCanonicalUrl(), [location.pathname, location.hash]);

  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          name: 'Art Flaneur Global Pty Ltd',
          url: 'https://www.artflaneur.com.au/',
          email: 'info@artflaneur.com.au',
        },
        {
          '@type': 'WebSite',
          name: DEFAULT_SITE_NAME,
          url: 'https://www.artflaneur.com.au/',
          description: DEFAULT_DESCRIPTION,
        },
      ],
    }),
    []
  );

  useSeo({
    title: `${DEFAULT_SITE_NAME} - Contemporary Art Guide`,
    description: DEFAULT_DESCRIPTION,
    canonicalUrl,
    jsonLd,
  });

  return null;
};

export default SiteSeo;
