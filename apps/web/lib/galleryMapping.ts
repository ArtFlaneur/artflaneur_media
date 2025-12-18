import { Gallery } from '../types';
import { GraphqlGallery } from './graphql';

/**
 * Convert gallery name to URL-friendly slug.
 * Example: "Museum of Modern Art" -> "museum-of-modern-art"
 */
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Create a URL slug from gallery name and ID.
 * Format: "gallery-name-id" for uniqueness.
 */
const createGallerySlug = (gallery: GraphqlGallery): string => {
  const nameSlug = gallery.galleryname ? slugify(gallery.galleryname) : '';
  if (nameSlug) {
    return `${nameSlug}-${gallery.id}`;
  }
  return String(gallery.id);
};

const buildGraphqlGalleryImage = (gallery: GraphqlGallery): string => {
  // Debug: log image URLs
  if (import.meta.env.DEV && (gallery.gallery_img_url || gallery.logo_img_url)) {
    console.log(`🖼️ Gallery ${gallery.galleryname} images:`, {
      gallery_img_url: gallery.gallery_img_url,
      logo_img_url: gallery.logo_img_url,
    });
  }

  if (gallery.gallery_img_url) {
    return gallery.gallery_img_url;
  }

  if (gallery.logo_img_url) {
    return gallery.logo_img_url;
  }

  return `https://picsum.photos/seed/graphql-gallery-${gallery.id}/600/600`;
};

export const mapGraphqlGalleryToEntity = (gallery: GraphqlGallery): Gallery => ({
  id: String(gallery.id),
  slug: createGallerySlug(gallery),
  name: gallery.galleryname ?? 'Gallery',
  city: gallery.city ?? undefined,
  country: gallery.country ?? undefined,
  address: gallery.fulladdress ?? undefined,
  website: gallery.placeurl ?? undefined,
  image: buildGraphqlGalleryImage(gallery),
  description: gallery.openinghours ?? undefined,
});
