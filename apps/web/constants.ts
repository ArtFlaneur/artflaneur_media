import { PricingTier, GalleryPoint } from './types';

export const NAV_ITEMS = [
  { label: 'Reviews', path: '/reviews' },
  { label: 'Exhibitions', path: '/exhibitions' },
  { label: 'Ambassadors', path: '/ambassadors' },
  { label: 'Artists', path: '/artists' },
  { label: 'Guides', path: '/guides' },
  { label: 'Galleries', path: '/galleries' },
];

export const GALLERY_PRICING: PricingTier[] = [
  {
    name: 'Basic',
    price: '$199/mo',
    features: ['Listing on Map', 'Basic Profile', 'Monthly Analytics Report'],
    cta: 'Start Trial',
  },
  {
    name: 'Featured',
    price: '$499/mo',
    features: ['Priority Map Placement', 'Featured in Weekend Guide', 'Real-time Analytics', 'Editorial Feature (1/yr)'],
    cta: 'Get Featured',
    highlight: true,
  },
  {
    name: 'Premium',
    price: 'Custom',
    features: ['Dedicated Ambassador Review', 'Push Notification Campaign', 'Full Data Suite', 'Unlimited Events'],
    cta: 'Contact Us',
  }
];

export const EVENT_PRICING: PricingTier[] = [
  {
    name: 'Listing',
    price: '$99/event',
    features: ['Event Calendar Listing', 'Basic Map Pin'],
    cta: 'List Event',
  },
  {
    name: 'Trail',
    price: '$299/event',
    features: ['Included in Art Trails', 'Push Notification', 'RSVP Link'],
    cta: 'Join Trail',
    highlight: true,
  },
  {
    name: 'Immersive',
    price: 'Custom',
    features: ['Full Coverage', 'Video Content', 'Live Data Heatmap'],
    cta: 'Partner',
  }
];

export const MAP_POINTS: GalleryPoint[] = [
  { id: 1, name: "The White Cube", lat: 50, lng: 50, type: 'Gallery' },
  { id: 2, name: "Modern Art Museum", lat: 30, lng: 60, type: 'Museum' },
  { id: 3, name: "Project Space X", lat: 70, lng: 40, type: 'Gallery' },
  { id: 4, name: "Biennale Pavilion", lat: 40, lng: 20, type: 'Event' },
];