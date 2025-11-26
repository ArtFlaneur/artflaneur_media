import type { BlockContent, Slug } from './types';

export type REVIEWS_QUERYResult = Array<{
  _id: string;
  title: string | null;
  slug: Slug | null;
  excerpt: string | null;
  mainImage: {
    asset: {
      _id: string;
      url: string | null;
    } | null;
    alt: string | null;
  } | null;
  author: {
    _id: string;
    name: string | null;
    slug: Slug | null;
    photo: {
      asset: {
        url: string | null;
      } | null;
    } | null;
  } | null;
  publishedAt: string | null;
  rating: number | null;
}>;

export type REVIEW_QUERYResult = {
  _id: string;
  title: string | null;
  slug: Slug | null;
  excerpt: string | null;
  mainImage: {
    asset: {
      _id: string;
      url: string | null;
    } | null;
    alt: string | null;
  } | null;
  coverImage: {
    asset: {
      url: string | null;
    } | null;
    alt: string | null;
    caption: string | null;
  } | null;
  body: BlockContent | null;
  rating: number | null;
  author: {
    _id: string;
    name: string | null;
    slug: Slug | null;
    photo: {
      asset: {
        url: string | null;
      } | null;
    } | null;
    bio: string | null;
  } | null;
  artists: Array<{
    _id: string;
    name: string | null;
    slug: Slug | null;
  }> | null;
  gallery: {
    _id: string;
    name: string | null;
    slug: Slug | null;
    city: string | null;
    address: string | null;
    website: string | null;
  } | null;
  exhibition: {
    _id: string;
    title: string | null;
    slug: Slug | null;
    gallery: {
      _id: string;
      name: string | null;
      slug: Slug | null;
      city: string | null;
      address: string | null;
      website: string | null;
    } | null;
    artists: Array<{
      _id: string;
      name: string | null;
      slug: Slug | null;
    }> | null;
    curators: Array<{
      _id: string;
      name: string | null;
      slug: Slug | null;
    }> | null;
  } | null;
  sponsorshipEnabled: 'no' | 'yes' | null;
  sponsor: {
    _id: string;
    name: string | null;
    logo: {
      asset: {
        url: string | null;
      } | null;
      alt: string | null;
    } | null;
    defaultBadgeTemplate: 'partnershipWith' | 'presentedBy' | 'presents' | 'supportedBy' | null;
    brandColor: {
      hex: string | null;
    } | null;
  } | null;
  sponsorBadgeSettings: {
    template: 'custom' | 'default' | 'partnershipWith' | 'presentedBy' | 'presents' | 'supportedBy' | null;
    customText: string | null;
    placement: 'afterTitle' | 'bottom' | 'sidebar' | 'top' | null;
    style: 'bold' | 'card' | 'default' | 'minimal' | 'subtle' | null;
  } | null;
  publishedAt: string | null;
} | null;

export type LATEST_REVIEWS_QUERYResult = Array<{
  _id: string;
  title: string | null;
  slug: Slug | null;
  excerpt: string | null;
  mainImage: {
    asset: {
      _id: string;
      url: string | null;
    } | null;
    alt: string | null;
  } | null;
  author: {
    _id: string;
    name: string | null;
    photo: {
      asset: {
        url: string | null;
      } | null;
    } | null;
  } | null;
  publishedAt: string | null;
  rating: number | null;
}>;

export type EXHIBITIONS_QUERYResult = Array<{
  _id: string;
  title: string | null;
  slug: Slug | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  gallery: {
    _id: string;
    name: string | null;
    slug: Slug | null;
    city: string | null;
    address: string | null;
    location: {
      lat?: number | null;
      lng?: number | null;
    } | null;
  } | null;
  artists: Array<{
    _id: string;
    name: string | null;
    slug: Slug | null;
  }> | null;
  mainImage: {
    asset: {
      url: string | null;
    } | null;
    alt: string | null;
  } | null;
  ticketing: {
    access: 'free' | 'ticketed' | null;
    ticketPrice: string | null;
    bookingUrl: string | null;
    ctaLabel: string | null;
  } | null;
}>;

export type ARTISTS_QUERYResult = Array<{
  _id: string;
  name: string | null;
  slug: Slug | null;
  bio: string | null;
  photo: {
    asset: {
      url: string | null;
    } | null;
    alt: string | null;
  } | null;
}>;

export type GUIDES_QUERYResult = Array<{
  _id: string;
  slug: Slug | null;
  title: string | null;
  city: string | null;
  description: string | null;
  coverImage: {
    asset: {
      url: string | null;
    } | null;
    alt: string | null;
  } | null;
  ctaText: string | null;
  sponsorshipStatus: 'notSponsored' | 'sponsored' | null;
  sponsor: {
    _id: string;
    name: string | null;
    logo: {
      asset: {
        url: string | null;
      } | null;
    } | null;
  } | null;
  stops: Array<{
    _key: string;
    title: string | null;
    summary: string | null;
    address: string | null;
    notes: string | null;
    image: {
      asset: {
        url: string | null;
      } | null;
      alt: string | null;
    } | null;
    gallery: {
      _id: string;
      name: string | null;
      address: string | null;
    } | null;
    exhibition: {
      _id: string;
      title: string | null;
      slug: Slug | null;
    } | null;
    location: {
      lat: number | null;
      lng: number | null;
    } | null;
  }> | null;
}>;

export type HOMEPAGE_QUERYResult = {
  _id: string;
  title: string | null;
  heroSection: {
    featuredReview: {
      _id: string;
      title: string | null;
      slug: Slug | null;
      excerpt: string | null;
      publishedAt: string | null;
      mainImage: {
        asset: {
          url: string | null;
        } | null;
        alt: string | null;
      } | null;
      author: {
        _id: string;
        name: string | null;
        photo: {
          asset: {
            url: string | null;
          } | null;
        } | null;
      } | null;
    } | null;
    weeklyStory: {
      _id: string;
      title: string | null;
      slug: Slug | null;
      excerpt: string | null;
      portrait: {
        asset: {
          url: string | null;
        } | null;
        alt: string | null;
      } | null;
      artist: {
        _id: string;
        name: string | null;
        slug: Slug | null;
      } | null;
    } | null;
  } | null;
  latestReviews: Array<{
    _id: string;
    title: string | null;
    slug: Slug | null;
    excerpt: string | null;
    publishedAt: string | null;
    mainImage: {
      asset: {
        url: string | null;
      } | null;
      alt: string | null;
    } | null;
    author: {
      _id: string;
      name: string | null;
      photo: {
        asset: {
          url: string | null;
        } | null;
      } | null;
    } | null;
  }> | null;
  featuredArtistStory: {
    _id: string;
    title: string | null;
    slug: Slug | null;
    portrait: {
      asset: {
        url: string | null;
      } | null;
      alt: string | null;
    } | null;
    artist: {
      _id: string;
      name: string | null;
      slug: Slug | null;
    } | null;
  } | null;
  weekendGuide: {
    _id: string;
    title: string | null;
    slug: Slug | null;
    city: string | null;
    description: string | null;
    ctaText: string | null;
    coverImage: {
      asset: {
        url: string | null;
      } | null;
      alt: string | null;
    } | null;
    sponsorshipStatus: 'notSponsored' | 'sponsored' | null;
    sponsor: {
      _id: string;
      name: string | null;
      logo: {
        asset: {
          url: string | null;
        } | null;
      } | null;
    } | null;
  } | null;
  aiChatbotTeaser: {
    headline: string | null;
    description: string | null;
    ctaText: string | null;
  } | null;
  newsletterSignup: {
    headline: string | null;
    description: string | null;
    placeholder: string | null;
    submitText: string | null;
  } | null;
} | null;

export type AUTHORS_QUERYResult = Array<{
  _id: string;
  name: string | null;
  slug: Slug | null;
  role: 'author' | 'chiefEditor' | 'editor' | null;
  bio: string | null;
  photo: {
    asset: {
      url: string | null;
    } | null;
  } | null;
  social: {
    instagram?: string;
    twitter?: string;
    website?: string;
  } | null;
}>;

export type GALLERIES_QUERYResult = Array<{
  _id: string;
  name: string | null;
  slug: Slug | null;
  city: string | null;
  country: string | null;
  address: string | null;
  location: {
    lat?: number | null;
    lng?: number | null;
  } | null;
  description: string | null;
  directusImageFile: string | null;
  mainImage: {
    asset: {
      url: string | null;
    } | null;
    alt: string | null;
  } | null;
}>;

export type GALLERY_QUERYResult = {
  _id: string;
  name: string | null;
  slug: Slug | null;
  city: string | null;
  country: string | null;
  address: string | null;
  description: string | null;
  website: string | null;
  workingHours: string | null;
  social?: {
    instagram?: string | null;
    facebook?: string | null;
    twitter?: string | null;
  } | null;
  contact?: {
    phone?: string | null;
    email?: string | null;
  } | null;
  directusImageFile: string | null;
  mainImage: {
    asset: {
      url: string | null;
    } | null;
    alt: string | null;
  } | null;
  location: {
    lat?: number | null;
    lng?: number | null;
  } | null;
  exhibitions: Array<{
    _id: string;
    title: string | null;
    slug: Slug | null;
    startDate: string | null;
    endDate: string | null;
    description: string | null;
    gallery: {
      _id: string;
      name: string | null;
      city: string | null;
    } | null;
    image: {
      asset: {
        url: string | null;
      } | null;
      alt: string | null;
    } | null;
  }> | null;
  reviews: Array<{
    _id: string;
    title: string | null;
    slug: Slug | null;
    excerpt: string | null;
    publishedAt: string | null;
    mainImage: {
      asset: {
        url: string | null;
      } | null;
      alt: string | null;
    } | null;
    author: {
      _id: string;
      name: string | null;
      slug: Slug | null;
      photo: {
        asset: {
          url: string | null;
        } | null;
      } | null;
    } | null;
  }> | null;
} | null;
