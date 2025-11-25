import { Article, ContentType, PricingTier, GalleryPoint, Artist, Exhibition, Guide, Author } from './types';

export const NAV_ITEMS = [
  { label: 'Reviews', path: '/reviews' },
  { label: 'Exhibitions', path: '/exhibitions' },
  { label: 'Ambassadors', path: '/ambassadors' },
  { label: 'Artists', path: '/artists' },
  { label: 'Guides', path: '/guides' },
  { label: 'Map', path: '/map' },
];

export const AUTHORS: Author[] = [
  { id: 'a1', name: 'Elena Vance', role: 'Senior Critic', image: 'https://picsum.photos/200/200?random=1', bio: 'Elena is a historian specializing in post-war avant-garde movements.' },
  { id: 'a2', name: 'Julian Basquiat', role: 'Editor', image: 'https://picsum.photos/200/200?random=2', bio: 'Covering the intersection of technology and fine art.' },
  { id: 'a3', name: 'Sarah Chen', role: 'Ambassador', image: 'https://picsum.photos/200/200?random=3', bio: 'Curator based in Tokyo.' },
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    type: ContentType.REVIEW,
    title: 'Echoes of the Void: Minimalism in 2024',
    subtitle: 'A stunning retrospective at The White Cube',
    author: AUTHORS[0],
    date: 'Nov 5, 2024',
    location: 'Modern Art Gallery, London',
    image: 'https://picsum.photos/800/600?random=10',
    content: 'The exhibition explores the silence between thoughts...'
  },
  {
    id: '2',
    type: ContentType.STORY,
    title: 'In the Studio: Marcus Thorne',
    subtitle: 'Chaos, canvas, and the search for meaning.',
    author: AUTHORS[1],
    date: 'Nov 3, 2024',
    image: 'https://picsum.photos/800/600?random=11',
  },
  {
    id: '4',
    type: ContentType.REVIEW,
    title: 'Digital Dreams: AI in Sculpture',
    subtitle: 'How algorithms are reshaping 3D forms.',
    author: AUTHORS[2],
    date: 'Oct 28, 2024',
    location: 'Tokyo Art Space',
    image: 'https://picsum.photos/800/600?random=13',
  },
  {
    id: '5',
    type: ContentType.NEWS,
    title: 'Venice Biennale Announces 2025 Curators',
    subtitle: 'A shift towards the Global South.',
    author: AUTHORS[0],
    date: 'Oct 25, 2024',
    image: 'https://picsum.photos/800/600?random=14',
  }
];

export const MOCK_ARTISTS: Artist[] = [
    {
        id: 'art1',
        name: 'Sarah Sze',
        image: 'https://picsum.photos/600/800?random=50',
        bio: 'Sarah Sze explores the ephemeral nature of matter and memory through intricate installations.',
        discipline: ['Installation', 'Sculpture'],
        location: 'New York, USA',
        featuredWork: 'https://picsum.photos/800/600?random=51'
    },
    {
        id: 'art2',
        name: 'Olafur Eliasson',
        image: 'https://picsum.photos/600/800?random=52',
        bio: 'Eliasson uses light, water, and air to create immersive environments that challenge perception.',
        discipline: ['Light', 'Installation'],
        location: 'Berlin, Germany',
        featuredWork: 'https://picsum.photos/800/600?random=53'
    },
    {
        id: 'art3',
        name: 'Yayoi Kusama',
        image: 'https://picsum.photos/600/800?random=54',
        bio: 'Avant-garde artist known for her extensive use of polka dots and infinity installations.',
        discipline: ['Painting', 'Performance'],
        location: 'Tokyo, Japan',
        featuredWork: 'https://picsum.photos/800/600?random=55'
    }
];

export const MOCK_EXHIBITIONS: Exhibition[] = [
    {
        id: 'ex1',
        title: 'Future Shock',
        gallery: '180 The Strand',
        city: 'London',
        image: 'https://picsum.photos/800/600?random=60',
        startDate: '2024-11-01',
        endDate: '2025-02-28',
        description: 'An exploration of the digital frontier.'
    },
    {
        id: 'ex2',
        title: 'Vermeer: The Retrospective',
        gallery: 'Rijksmuseum',
        city: 'Amsterdam',
        image: 'https://picsum.photos/800/600?random=61',
        startDate: '2024-10-15',
        endDate: '2025-01-15',
        description: 'The largest collection of Vermeer paintings ever assembled.'
    },
     {
        id: 'ex3',
        title: 'Basquiat x Warhol',
        gallery: 'Fondation Louis Vuitton',
        city: 'Paris',
        image: 'https://picsum.photos/800/600?random=62',
        startDate: '2024-12-01',
        endDate: '2025-04-01',
        description: 'Four hands, one canvas.'
    }
];

export const MOCK_GUIDES: Guide[] = [
    {
        id: 'g1',
        type: ContentType.GUIDE,
        title: 'Berlin Art Week: The Essentials',
        city: 'Berlin',
        image: 'https://picsum.photos/800/600?random=70',
        author: AUTHORS[0],
        steps: [
            { id: 's1', title: 'KW Institute', description: 'Start here for cutting edge contemporary discourse.', image: 'https://picsum.photos/400/300?random=71', location: 'Auguststraße 69' },
            { id: 's2', title: 'Boros Collection', description: 'A bunker filled with art. Book months in advance.', image: 'https://picsum.photos/400/300?random=72', location: 'Reinhardtstraße 20' },
            { id: 's3', title: 'König Galerie', description: 'Brutalist church turned gallery space.', image: 'https://picsum.photos/400/300?random=73', location: 'Alexandrinenstraße 118' }
        ]
    },
    {
        id: 'g2',
        type: ContentType.GUIDE,
        title: 'Hidden Paris: Beyond the Louvre',
        city: 'Paris',
        image: 'https://picsum.photos/800/600?random=74',
        author: AUTHORS[1],
        steps: [
            { id: 's1', title: 'Palais de Tokyo', description: 'Anti-museum energy.', image: 'https://picsum.photos/400/300?random=75', location: '13 Av. du Président Wilson' },
            { id: 's2', title: 'Perrotin', description: 'A classic in the Marais.', image: 'https://picsum.photos/400/300?random=76', location: '76 Rue de Turenne' }
        ]
    }
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