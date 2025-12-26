export enum ContentType {
  REVIEW = 'Review',
  GUIDE = 'Guide',
  STORY = 'Artist Story',
  NEWS = 'News',
  EXHIBITION = 'Exhibition',
  EVENT = 'Art Event',
  ARTIST = 'Artist',
  AUTHOR = 'Ambassador',
  GALLERY = 'Gallery'
}

export interface Author {
  id: string;
  slug?: string; // URL-friendly identifier
  name: string;
  role: string;
  image: string;
  bio?: string;
}

export interface Article {
  id: string;
  slug?: string; // URL-friendly identifier
  website?: string;
  title: string;
  subtitle?: string;
  author?: Author;
  date?: string;
  image: string;
  location?: string;
  content?: string;
  galleryImages?: string[];
  tags?: string[];
  type?: ContentType;
}

export interface Artist {
  id: string;
  slug?: string; // URL-friendly identifier
  name: string;
  image: string;
  bio: string;
  discipline: string[];
  location: string;
  featuredWork: string;
  lifespan?: string; // e.g. "1881–1973" or "b. 1965"
}

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  image: string;
  location: string;
}

export interface Guide extends Article {
  steps: GuideStep[];
  city: string;
}

export interface Exhibition {
  id: string;
  slug?: string; // URL-friendly identifier
  title: string;
  gallery: string;
  image: string;
  startDate: string;
  endDate: string;
  description: string;
  artist?: string;
  city: string;
  country?: string;
  startEpochSeconds?: number;
  endEpochSeconds?: number;
}

export interface Gallery {
  id: string;
  slug?: string;
  name: string;
  city?: string;
  country?: string;
  address?: string;
  website?: string;
  image: string;
  description?: string;
}

export interface PricingTier {
  name: string;
  price: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}

export interface NavItem {
  label: string;
  path: string;
}
