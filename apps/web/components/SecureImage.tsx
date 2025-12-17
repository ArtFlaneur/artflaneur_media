import React, { useEffect, useState } from 'react';
import { resolveSecureImageUrl, shouldUseSecureImage } from '../lib/secureImageService';

export type SecureImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src?: string;
};

const SecureImage = React.forwardRef<HTMLImageElement, SecureImageProps>(({ src, ...rest }, ref) => {
  const needsSecure = shouldUseSecureImage(src);
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(needsSecure ? undefined : src);
  const [loading, setLoading] = useState(needsSecure);

  useEffect(() => {
    let isMounted = true;

    if (!src || !needsSecure) {
      setResolvedSrc(src);
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setLoading(true);
    resolveSecureImageUrl(src)
      .then((secureUrl) => {
        if (isMounted) {
          setResolvedSrc(secureUrl);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Secure image load failed:', error);
        if (isMounted) {
          // On error, show placeholder instead of broken auth URL
          setResolvedSrc(`https://picsum.photos/seed/${encodeURIComponent(src)}/600/600`);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src, needsSecure]);

  // Don't render img tag until we have a resolved URL for secure images
  if (loading || !resolvedSrc) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse ${rest.className || ''}`}
        style={{ aspectRatio: '1/1', ...rest.style }}
      />
    );
  }

  return <img ref={ref} src={resolvedSrc} {...rest} />;
});

SecureImage.displayName = 'SecureImage';

export default SecureImage;
