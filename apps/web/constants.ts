import { PricingTier } from './types';

export const NAV_ITEMS = [
  { label: 'Stories', path: '/stories' },
  { label: 'Galleries', path: '/galleries' },
  { label: 'Exhibitions', path: '/exhibitions' },
  { label: 'Guides', path: '/guides' },
];

export const GALLERY_PRICING: PricingTier[] = [
  {
    name: 'Free',
    price: '$0/month',
    features: [
      'Basic gallery listing on map',
      'Profile with hours & contact',
      'Mobile app + website listing'
    ],
    cta: 'Create Free Listing',
  },
  {
    name: 'Visibility Pro',
    price: '$249/month',
    features: [
      'Everything in Free',
      'Priority map placement',
      'Real-time analytics report',
      'Visitor insights (count, origin, peak hours)',
      'Up to 3 exhibitions featured',
      '1 curated Guide feature/month',
      'Email support'
    ],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Insights Premium',
    price: '$649/month',
    features: [
      'Everything in Visibility Pro',
      'Real-time visitor heatmaps',
      'Journey tracking between spaces',
      'Real-time analytics dashboard',
      'Exhibition impact reports',
      'Return visitor tracking',
      'Downloadable reports for boards',
      'Priority support + quarterly calls',
      'Up to 10 exhibitions featured',
      '3 curated Guide features/month'
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: 'From $1,499/month',
    features: [
      'Everything in Insights Premium',
      'White-label app option',
      'Unlimited event listings',
      'Unlimited Guide features',
      'API access for integrations',
      'Multi-location dashboard',
      'Dedicated account manager',
      'SLA & priority support'
    ],
    cta: 'Schedule Demo',
  }
];

export const EVENT_PRICING: PricingTier[] = [
  {
    name: 'RSVP Listing',
    price: '$89/event',
    features: [
      'Event listing on map',
      'Event banner in the app',
      'Up to 7 event points',
      'Free RSVP system (no payment)',
      'Basic event metrics report',
      'Calendar integration'
    ],
    cta: 'List RSVP Event',
  },
  {
    name: 'Event Route + Ticketing',
    price: '$299/event',
    features: [
      'Everything in RSVP',
      'Interactive Route map (15-30 points)',
      'Geo-fencing push notifications',
      'Paid ticketing system',
      'QR code ticket generation',
      'Real-time analytics dashboard',
      'Post-event analytics report',
      'Custom Guide creation on the website'
    ],
    cta: 'Create Ticketing Route',
  },
  {
    name: 'Festival + Media',
    price: '$599-899/event',
    features: [
      'Everything in Event Route',
      'Up to 40-50 event points',
      'Advanced analytics & heatmaps',
      'Professional video (2-3 min)',
      '10-15 high-res photos',
      '2-3 social media reels',
      'Ambassador review feature',
      'Push notification campaigns',
      'Newsletter features',
      'White-label option'
    ],
    cta: 'Discuss Package',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'From $2,499/event',
    features: [
      'Everything in Festival + Media',
      'Unlimited event locations',
      'Unlimited exhibitions/artworks',
      'Multi-venue analytics dashboard',
      'Dedicated project manager',
      'On-site setup & training',
      'Priority technical support',
      'Custom integrations & API',
      'Post-event comprehensive report',
      'Multi-year contracts: 15-20% discount'
    ],
    cta: 'Request Enterprise Demo',
  }
];
