import React, { useEffect, useState } from 'react';
import { resolveSecureImageUrl, shouldUseSecureImage } from '../lib/secureImageService';

export type SecureImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src?: string;
};

const SecureImage = React.forwardRef<HTMLImageElement, SecureImageProps>(({ src, ...rest }, ref) => {
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(src);

  useEffect(() => {
    let isMounted = true;

    if (!src || !shouldUseSecureImage(src)) {
      setResolvedSrc(src);
      return () => {
        isMounted = false;
      };
    }

    resolveSecureImageUrl(src)
      .then((secureUrl) => {
        if (isMounted) {
          setResolvedSrc(secureUrl);
        }
      })
      .catch((error) => {
        console.error('Secure image load failed:', error);
        if (isMounted) {
          setResolvedSrc(src);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src]);

  const finalSrc = resolvedSrc ?? src ?? '';
  return <img ref={ref} src={finalSrc} {...rest} />;
});

SecureImage.displayName = 'SecureImage';

export default SecureImage;
