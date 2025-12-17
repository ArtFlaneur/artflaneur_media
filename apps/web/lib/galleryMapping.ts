import { Gallery } from '../types';
import { GraphqlGallery } from './graphql';

const buildGraphqlGalleryImage = (gallery: GraphqlGallery): string => {
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
  slug: String(gallery.id),
  name: gallery.galleryname ?? 'Gallery',
  city: gallery.city ?? undefined,
  country: gallery.country ?? undefined,
  address: gallery.fulladdress ?? undefined,
  website: gallery.placeurl ?? undefined,
  image: buildGraphqlGalleryImage(gallery),
  description: gallery.openinghours ?? undefined,
});
