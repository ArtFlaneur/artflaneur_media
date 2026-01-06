import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { DEFAULT_SITE_NAME, DEFAULT_DESCRIPTION, getDefaultCanonicalUrl } from '../lib/seo';
import { useSeo } from '../lib/useSeo';

const SiteSeo: React.FC = () => {
  const location = useLocation();

  const IOS_APP_URL = 'https://apps.apple.com/au/app/art-flaneur-discover-art/id6449169783';
  const ANDROID_APP_URL = 'https://play.google.com/store/apps/details?id=com.artflaneur';

  const canonicalUrl = useMemo(() => getDefaultCanonicalUrl(), [location.pathname, location.search]);

  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          name: 'Art Flaneur Global Pty Ltd',
          url: 'https://www.artflaneur.art/',
          email: 'info@artflaneur.com.au',
        },
        {
          '@type': 'WebSite',
          name: DEFAULT_SITE_NAME,
          url: 'https://www.artflaneur.art/',
          description: DEFAULT_DESCRIPTION,
        },
        {
          '@type': 'SoftwareApplication',
          name: 'Art Flaneur',
          operatingSystem: 'iOS, Android',
          applicationCategory: 'TravelApplication',
          url: 'https://www.artflaneur.art/',
          downloadUrl: [IOS_APP_URL, ANDROID_APP_URL],
          publisher: {
            '@type': 'Organization',
            name: 'Art Flaneur Global Pty Ltd',
            url: 'https://www.artflaneur.art/',
          },
          sameAs: [IOS_APP_URL, ANDROID_APP_URL],
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
