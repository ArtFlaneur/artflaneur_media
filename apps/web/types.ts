import { LucideIcon } from 'lucide-react';

export enum ContentType {
  REVIEW = 'Review',
  GUIDE = 'Guide',
  STORY = 'Artist Story',
  NEWS = 'News',
  EXHIBITION = 'Exhibition',
  EVENT = 'Art Event',
  ARTIST = 'Artist',
  AUTHOR = 'Ambassador'
}

export interface Author {
  id: string;
  name: string;
  role: string;
  image: string;
  bio?: string;
}

export interface Article {
  id: string;
  type: ContentType;
  title: string;
  subtitle?: string;
  author?: Author;
  date?: string;
  image: string;
  location?: string;
  content?: string;
  galleryImages?: string[];
  tags?: string[];
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  bio: string;
  discipline: string[];
  location: string;
  featuredWork: string;
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
  title: string;
  gallery: string;
  image: string;
  startDate: string;
  endDate: string;
  description: string;
  city: string;
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

export interface GalleryPoint {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: 'Gallery' | 'Museum' | 'Event';
}