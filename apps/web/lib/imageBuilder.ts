import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { sanityConfig } from '../sanity/lib/client';

const builder = imageUrlBuilder({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
});

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpg' | 'png' | 'webp';
  fit?: 'clip' | 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'min';
}

/**
 * Оптимизирует изображения из Sanity с автоматическим сжатием
 * По умолчанию: WebP формат, quality 80, fit max
 */
export const urlFor = (source: SanityImageSource) => {
  return builder.image(source);
};

/**
 * Получить оптимизированный URL изображения
 */
export const getOptimizedImageUrl = (
  source: SanityImageSource | undefined | null,
  options: ImageOptions = {}
): string | null => {
  if (!source) return null;

  const {
    width = 1200,
    height,
    quality = 80,
    format = 'webp',
    fit = 'max',
  } = options;

  try {
    let url = urlFor(source)
      .width(width)
      .quality(quality)
      .format(format)
      .fit(fit);

    if (height) {
      url = url.height(height);
    }

    return url.url();
  } catch (error) {
    console.error('Error building image URL:', error);
    return null;
  }
};

/**
 * Получить набор оптимизированных URL для responsive изображений
 */
export const getResponsiveImageUrls = (
  source: SanityImageSource | undefined | null,
  options: Omit<ImageOptions, 'width'> = {}
): { src: string; srcSet: string } | null => {
  if (!source) return null;

  const widths = [400, 800, 1200, 1600];
  const { quality = 80, format = 'webp', fit = 'max' } = options;

  try {
    const srcSet = widths
      .map((width) => {
        const url = urlFor(source)
          .width(width)
          .quality(quality)
          .format(format)
          .fit(fit)
          .url();
        return `${url} ${width}w`;
      })
      .join(', ');

    const src = getOptimizedImageUrl(source, { ...options, width: 1200 }) || '';

    return { src, srcSet };
  } catch (error) {
    console.error('Error building responsive image URLs:', error);
    return null;
  }
};

/**
 * Пресеты для разных типов изображений
 */
export const imagePresets = {
  // Главное изображение статьи/ревью
  hero: (source: SanityImageSource | undefined | null) =>
    getOptimizedImageUrl(source, { width: 1600, quality: 85 }),

  // Превью для карточек
  card: (source: SanityImageSource | undefined | null) =>
    getOptimizedImageUrl(source, { width: 600, quality: 80 }),

  // Миниатюры
  thumbnail: (source: SanityImageSource | undefined | null) =>
    getOptimizedImageUrl(source, { width: 400, quality: 75 }),

  // Аватары
  avatar: (source: SanityImageSource | undefined | null) =>
    getOptimizedImageUrl(source, { width: 200, height: 200, quality: 80, fit: 'crop' }),

  // Логотипы (PNG для прозрачности)
  logo: (source: SanityImageSource | undefined | null) =>
    getOptimizedImageUrl(source, { width: 300, quality: 90, format: 'png' }),

  // Изображения в контенте
  content: (source: SanityImageSource | undefined | null) =>
    getOptimizedImageUrl(source, { width: 1200, quality: 82 }),
};

/**
 * Fallback для старых URL (когда уже используется прямой asset.url)
 * Добавляет параметры оптимизации к существующему URL
 */
export const optimizeExistingUrl = (
  url: string | undefined | null,
  options: ImageOptions = {}
): string | null => {
  if (!url) return null;

  // Если это не Sanity CDN URL, возвращаем как есть
  if (!url.includes('cdn.sanity.io')) return url;

  const {
    width = 1200,
    quality = 80,
    format = 'webp',
    fit = 'max',
  } = options;

  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('w', width.toString());
    urlObj.searchParams.set('q', quality.toString());
    urlObj.searchParams.set('fm', format);
    urlObj.searchParams.set('fit', fit);
    urlObj.searchParams.set('auto', 'format');

    return urlObj.toString();
  } catch (error) {
    console.error('Error optimizing existing URL:', error);
    return url;
  }
};
