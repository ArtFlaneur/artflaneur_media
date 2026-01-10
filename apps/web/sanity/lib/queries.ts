import { defineQuery } from 'groq'

// Reviews queries
export const REVIEWS_QUERY = defineQuery(`*[
  _type == "review"
  && publishStatus == "published"
] | order(publishedAt desc) [0...10] {
  _id,
  title,
  slug,
  "excerpt": coalesce(summary, excerpt),
  mainImage {
    asset->{
      _id,
      url
    },
    alt
  },
  author->{
    _id,
    name,
    slug,
    photo {
      asset->{
        url
      }
    }
  },
  publishedAt,
  externalExhibition {
    _type,
    id,
    title,
    startDate,
    endDate,
    artist,
    description,
    eventType,
    exhibitionType,
    gallery {
      id,
      name,
      city,
      address,
      website,
      openingHours,
      allowed,
      specialEvent,
      eventType
    }
  }
}`)

export const REVIEW_QUERY = defineQuery(`*[
  _type == "review"
  && slug.current == $slug
][0] {
  _id,
  title,
  slug,
  "excerpt": coalesce(summary, excerpt),
  mainImage {
    asset->{
      _id,
      url
    },
    alt
  },
  heroSlider[]{
    _key,
    asset->{
      _id,
      url
    },
    alt,
    caption
  },
  galleryImages[]{
    _key,
    asset->{
      _id,
      url
    },
    alt,
    caption,
    credit
  },
  body[]{
    ...,
    _type == "image" => {
      _key,
      _type,
      asset->{
        _id,
        url
      },
      alt,
      caption
    }
  },
  author->{
    _id,
    name,
    slug,
    photo {
      asset->{
        url
      }
    },
    bio
  },
  externalExhibition {
    _type,
    id,
    title,
    startDate,
    endDate,
    artist,
    description,
    eventType,
    exhibitionType,
    gallery {
      id,
      name,
      city,
      address,
      website,
      openingHours,
      allowed,
      specialEvent,
      eventType
    }
  },
  relatedReviews[]->{
    _id,
    title,
    slug,
    "excerpt": coalesce(summary, excerpt),
    mainImage {
      asset->{
        url
      }
    },
    author->{
      _id,
      name
    }
  },
  ctaText,
  appCta,
  sponsorship {
    enabled,
    type,
    customDisclaimer,
    badgePlacement,
    sponsor->{
      _id,
      name,
      logo {
        asset->{
          url
        },
        alt
      },
      defaultBadgeTemplate,
      brandColor {
        hex
      }
    }
  },
  publishedAt
}`)

// Latest reviews query (for homepage)
export const LATEST_REVIEWS_QUERY = defineQuery(`*[
  _type == "review"
  && publishStatus == "published"
] | order(publishedAt desc) [0...$limit] {
  _id,
  title,
  slug,
  "excerpt": coalesce(summary, excerpt),
  mainImage {
    asset->{
      _id,
      url
    },
    alt
  },
  author->{
    _id,
    name,
    photo {
      asset->{
        url
      }
    }
  },
  publishedAt
}`)

// Articles queries (new unified content type)
export const ARTICLES_QUERY = defineQuery(`*[
  _type == "article"
  && publishStatus == "published"
] | order(publishedAt desc) {
  _id,
  title,
  slug,
  contentType,
  "excerpt": coalesce(summary, excerpt),
  mainImage {
    asset->{
      _id,
      url
    },
    alt
  },
  author->{
    _id,
    name,
    slug,
    photo {
      asset->{
        url
      }
    }
  },
  publishedAt,
  newsSource,
  bookTitle,
  bookAuthor,
  filmReviews[]{
    _key,
    title,
    director,
    summary,
    releaseYear,
    duration,
    whereToWatch,
    filmLink,
    still{
      asset->{
        _id,
        url
      },
      alt,
      caption
    }
  },
  externalExhibition {
    _type,
    id,
    title,
    startDate,
    endDate,
    artist,
    description,
    eventType,
    exhibitionType,
    gallery {
      id,
      name,
      city,
      address,
      website,
      openingHours,
      allowed,
      specialEvent,
      eventType
    }
  }
}`)

export const ARTICLE_QUERY = defineQuery(`*[
  _type == "article"
  && slug.current == $slug
][0] {
  _id,
  title,
  slug,
  contentType,
  "excerpt": coalesce(summary, excerpt),
  mainImage {
    asset->{
      _id,
      url
    },
    alt
  },
  heroSlider[]{
    _key,
    asset->{
      _id,
      url
    },
    alt,
    caption
  },
  body[]{
    ...,
    _type == "image" => {
      _key,
      _type,
      asset->{
        _id,
        url
      },
      alt,
      caption
    }
  },
  author->{
    _id,
    name,
    slug,
    photo {
      asset->{
        url
      }
    },
    bio
  },
  externalExhibition {
    _type,
    id,
    title,
    startDate,
    endDate,
    artist,
    description,
    eventType,
    exhibitionType,
    gallery {
      id,
      name,
      city,
      address,
      website,
      openingHours,
      allowed,
      specialEvent,
      eventType
    }
  },
  newsDate,
  newsSource,
  externalLink,
  bookTitle,
  bookAuthor,
  publisher,
  publishYear,
  isbn,
  purchaseLink,
  filmReviews[]{
    _key,
    title,
    director,
    summary,
    releaseYear,
    duration,
    whereToWatch,
    filmLink,
    still{
      asset->{
        _id,
        url
      },
      alt,
      caption
    }
  },
  relatedArticles[]->{
    _id,
    title,
    slug,
    contentType,
    "excerpt": coalesce(summary, excerpt),
    mainImage {
      asset->{
        url
      }
    },
    author->{
      _id,
      name
    }
  },
  ctaText,
  appCta,
  sponsorship {
    enabled,
    type,
    customDisclaimer,
    badgePlacement,
    sponsor->{
      _id,
      name,
      logo {
        asset->{
          url
        },
        alt
      },
      defaultBadgeTemplate,
      brandColor {
        hex
      }
    }
  },
  publishedAt
}`)

export const EXHIBITION_QUERY = defineQuery(`*[
  _type == "exhibition"
  && slug.current == $slug
][0] {
  _id,
  title,
  slug,
  description,
  startDate,
  endDate,
  gallery->{
    _id,
    name,
    slug,
    city,
    address,
    "location": coalesce(location, geopoint),
    website,
    "openingHours": coalesce(openingHours, workingHours)
  },
  artists[]->{
    _id,
    name,
    slug,
    bio,
    photo {
      asset->{
        url
      }
    }
  },
  "mainImage": image{
    asset->{
      url
    },
    alt
  },
  ticketing{
    access,
    ticketPrice,
    bookingUrl,
    ctaLabel
  }
}`)

// Galleries queries
export const GALLERIES_QUERY = defineQuery(`*[
  _type == "gallery"
] | order(name asc) {
  _id,
  name,
  slug,
  city,
  country,
  address,
  "location": coalesce(location, geopoint),
  description,
  "mainImage": coalesce(mainImage, image) {
    asset->{
      url
    },
    alt
  }
}`)

export const PAGINATED_GALLERIES_QUERY = defineQuery(`*[
  _type == "gallery"
] | order(name asc) [$offset...$end] {
  _id,
  name,
  slug,
  city,
  country,
  address,
  "location": coalesce(location, geopoint),
  description,
  "mainImage": coalesce(mainImage, image) {
    asset->{
      url
    },
    alt
  }
}`)

export const GALLERIES_COUNT_QUERY = defineQuery(`count(*[
  _type == "gallery"
])`)

export const GALLERY_QUERY = defineQuery(`*[
  _type == "gallery"
  && slug.current == $slug
][0] {
  _id,
  name,
  slug,
  city,
  country,
  address,
  "location": coalesce(location, geopoint),
  description,
  website,
  workingHours,
  social,
  contact,
  "mainImage": coalesce(mainImage, image) {
    asset->{
      url
    },
    alt
  },
  "exhibitions": *[_type == "exhibition" && references(^._id)] | order(startDate desc) [0...8] {
    _id,
    title,
    slug,
    startDate,
    endDate,
    description,
    gallery->{
      _id,
      name,
      city
    },
    "image": image{
      asset->{
        url
      },
      alt
    }
  },
  "reviews": *[
    _type == "review"
    && publishStatus == "published"
    && (
      gallery._ref == ^._id
      || exhibition->gallery._ref == ^._id
    )
  ] | order(publishedAt desc) [0...8] {
    _id,
    title,
    slug,
    "excerpt": coalesce(summary, excerpt),
    publishedAt,
    mainImage {
      asset->{
        url
      },
      alt
    },
    author->{
      _id,
      name,
      slug,
      photo {
        asset->{
          url
        }
      }
    }
  }
}`)

// Artists queries
export const ARTISTS_QUERY = defineQuery(`*[
  _type == "artist"
] | order(name asc) {
  _id,
  name,
  slug,
  bio,
  photo {
    asset->{
      url
    },
    alt
  }
}`)

export const PAGINATED_ARTISTS_QUERY = defineQuery(`*[
  _type == "artist"
] | order(name asc) [$offset...$end] {
  _id,
  name,
  slug,
  bio,
  photo {
    asset->{
      url
    },
    alt
  }
}`)

export const ARTIST_QUERY = defineQuery(`*[
  _type == "artist"
  && slug.current == $slug
][0] {
  _id,
  name,
  slug,
  bio,
  birthYear,
  country,
  photo {
    asset->{
      url
    },
    alt
  },
  website,
  social,
  "exhibitions": *[_type == "exhibition" && references(^._id)] | order(startDate desc) [0...10] {
    _id,
    title,
    slug,
    startDate,
    endDate,
    gallery->{
      name,
      city
    }
  }
}`)

export const ARTIST_STORY_BY_GRAPHQL_ID_QUERY = defineQuery(`*[
  _type == "artistStory"
  && externalArtist.id == $artistId
  && publishStatus == "published"
] | order(_updatedAt desc) [0] {
  _id,
  title,
  summary,
  biography,
  portrait{
    asset->{
      url
    },
    alt
  },
  externalArtist{
    id,
    name
  },
  author->{
    _id,
    name,
    slug
  },
  appCta{
    text,
    deeplink
  },
  sponsorship{
    enabled,
    type,
    customDisclaimer,
    badgePlacement,
    sponsor->{
      _id,
      name,
      logo{
        asset->{
          url
        },
        alt
      },
      brandColor{
        hex
      }
    }
  },
  multimediaSections[]{
    _key,
    title,
    description,
    videoUrl,
    ctaText,
    ctaUrl,
    fallbackImage{
      asset->{
        url
      },
      alt,
      caption
    }
  },
  artworkGallery[]{
    _key,
    asset->{
      url
    },
    alt,
    caption,
    title,
    year
  }
}`)

// Homepage content query
export const HOMEPAGE_QUERY = defineQuery(`*[
  _type == "homepageContent"
  && _id == "homepageContent"
][0] {
  _id,
  title,
  heroSection{
    featuredReview->{
      _id,
      title,
      slug,
      "excerpt": coalesce(summary, excerpt),
      publishedAt,
      mainImage{
        asset->{
          url
        },
        alt
      },
      heroSlider[]{
        asset->{
          url
        },
        alt,
        caption
      },
      author->{
        _id,
        name,
        photo{
          asset->{
            url
          }
        }
      }
    },
    weeklyStory->{
      _id,
      title,
      slug,
      "excerpt": summary,
      portrait{
        asset->{
          url
        },
        alt
      },
      externalArtist{
        id,
        name,
        country,
        description,
        birthYear,
        deathYear,
        wikipediaUrl
      }
    }
  },
  latestReviews[]->{
    _id,
    title,
    slug,
    "excerpt": coalesce(summary, excerpt),
    publishedAt,
    mainImage{
      asset->{
        url
      },
      alt
    },
    author->{
      _id,
      name,
      photo{
        asset->{
          url
        }
      }
    }
  },
  featuredArtistStory->{
    _id,
    title,
    slug,
    portrait{
      asset->{
        url
      },
      alt
    },
    externalArtist{
      id,
      name,
      country,
      description,
      birthYear,
      deathYear,
      wikipediaUrl
    }
  },
  spotlightExhibitions[]{
    _key,
    badge,
    featureCopy,
    ctaText,
    cardImage{
      asset->{
        url
      },
      alt
    },
    exhibition{
      id,
      title,
      startDate,
      endDate,
      gallery{
        id,
        name,
        city
      }
    }
  },
  featuredGalleries[]{
    _key,
    featureCopy,
    ctaText,
    ctaUrl,
    gallery{
      id,
      name
    },
    sponsor->{
      _id,
      name,
      logo{
        asset->{
          url
        },
        alt
      },
      brandColor{
        hex
      }
    },
    highlightedExhibitions[]{
      _key,
      id,
      title
    }
  },
  cityPicks[]{
    _key,
    city,
    tagline,
    ctaText,
    ctaUrl,
    heroImage{
      asset->{
        url
      },
      alt
    },
    sponsor->{
      _id,
      name,
      logo{
        asset->{
          url
        },
        alt
      }
    },
    picks[]{
      _key,
      "document": @->{
        _id,
        _type,
        title,
        slug,
        "excerpt": coalesce(summary, description),
        mainImage{
          asset->{
            url
          },
          alt
        },
        coverImage{
          asset->{
            url
          },
          alt
        },
        publishedAt
      }
    }
  },
  weekendGuide->{
    _id,
    title,
    slug,
    city,
    description,
    ctaText,
    coverImage{
      asset->{
        url
      },
      alt
    },
    sponsorship {
      enabled,
      type,
      badgePlacement,
      customDisclaimer,
      sponsor->{
        _id,
        name,
        logo{
          asset->{
            url
          },
          alt
        }
      }
    }
  },
  tickerMarquee{
    messages[]{
      _key,
      message,
      status
    }
  },
  aiChatbotTeaser{
    headline,
    description,
    ctaText
  },
  newsletterSignup{
    headline,
    description,
    placeholder,
    submitText
  },
  comingSoon[]{
    _key,
    urgencyLabel,
    ctaText,
    ctaUrl,
    sponsor->{
      _id,
      name,
      logo{
        asset->{
          url
        },
        alt
      }
    },
    exhibition{
      id,
      title,
      description,
      startDate,
      endDate,
      gallery{
        id,
        name,
        city,
        address
      }
    }
  },
  displayAds[]{
    _key,
    placement,
    label,
    headline,
    body,
    ctaText,
    ctaUrl,
    backgroundColor,
    image{
      asset->{
        url
      },
      alt
    }
  }
}`)

// Site settings query
export const SITE_SETTINGS_QUERY = defineQuery(`*[
  _type == "siteSettings"
][0] {
  _id,
  title,
  description,
  keywords,
  logo {
    asset->{
      url
    }
  },
  social
}`)

export const HOMEPAGE_TICKER_QUERY = defineQuery(`*[
  _type == "homepageContent"
  && _id == "homepageContent"
][0] {
  tickerMarquee{
    messages[]{
      _key,
      message,
      status
    }
  }
}`)

// Authors query
export const AUTHORS_QUERY = defineQuery(`*[
  _type == "author"
] | order(name asc) {
  _id,
  name,
  slug,
  role,
  bio,
  photo {
    asset->{
      url
    }
  },
  social
}`)

// Guides query
export const GUIDES_QUERY = defineQuery(`*[
  _type == "guide"
  && publishStatus == "published"
] | order(_createdAt desc) {
  _id,
  slug,
  title,
  city,
  "description": summary,
  coverImage {
    asset->{
      url
    },
    alt
  },
  ctaText,
  sponsorship {
    enabled,
    type,
    badgePlacement,
    customDisclaimer,
    sponsor->{
      _id,
      name,
      logo {
        asset->{
          url
        },
        alt
      }
    }
  },
  stops[] {
    _key,
    title,
    summary,
    notes,
    curatorQuote,
    externalGallery {
      _type,
      id,
      name,
      city,
      address,
      website
    }
  }
}`)

// Query to get unique cities from guides
export const GUIDES_CITIES_QUERY = defineQuery(`*[
  _type == "guide"
  && publishStatus == "published"
  && defined(city)
]{ "city": city } | order(city asc)`)

// Guide query (single)
export const GUIDE_QUERY = defineQuery(`*[
  _type == "guide"
  && publishStatus == "published"
  && slug.current == $slug
][0] {
  _id,
  title,
  city,
  "description": summary,
  body,
  ctaText,
  publishStatus,
  publishedAt,
  author->{
    _id,
    name,
    slug,
    role
  },
  seo{
    metaTitle,
    metaDescription,
    keywords
  },
  schemaMarkup,
  coverImage {
    asset->{
      url
    },
    alt
  },
  appScreenshot {
    asset->{
      url
    },
    alt
  },
  sponsorship {
    enabled,
    type,
    badgePlacement,
    customDisclaimer,
    sponsor->{
      _id,
      name,
      logo {
        asset->{
          url
        },
        alt
      }
    }
  },
  coverImage {
    asset->{
      url
    },
    alt
  },
  stops[] {
    _key,
    title,
    summary,
    notes,
    curatorQuote,
    externalGallery {
      _type,
      id,
      name,
      city,
      address,
      website
    }
  }
}`)

// Single author by slug
export const AUTHOR_QUERY = defineQuery(`*[
  _type == "author"
  && slug.current == $slug
][0] {
  _id,
  name,
  slug,
  email,
  role,
  photo {
    asset->{
      url
    },
    alt
  },
  "posts": *[_type == "review" && references(^._id)] | order(publishedAt desc) [0...10] {
    _id,
    title,
    slug,
    publishedAt,
    "excerpt": coalesce(summary, excerpt),
    mainImage {
      asset->{
        url
      },
      alt
    }
  }
}`)

// Art Events queries
export const ART_EVENTS_QUERY = defineQuery(`*[
  _type == "artEvent"
  && startDate >= $startDate
  && endDate <= $endDate
] | order(startDate asc) {
  _id,
  name,
  slug,
  type,
  discipline,
  startDate,
  endDate,
  city,
  country,
  region,
  website,
  instagram,
  email,
  organizer
}`)

export const ALL_ART_EVENTS_QUERY = defineQuery(`*[
  _type == "artEvent"
] | order(startDate asc) {
  _id,
  name,
  slug,
  type,
  discipline,
  startDate,
  endDate,
  city,
  country,
  region,
  website,
  instagram,
  email,
  organizer
}`)

export const ART_EVENT_QUERY = defineQuery(`*[
  _type == "artEvent"
  && slug.current == $slug
][0] {
  _id,
  name,
  slug,
  type,
  discipline,
  startDate,
  endDate,
  city,
  country,
  region,
  website,
  instagram,
  email,
  organizer
}`)

export const CURATOR_QUERY = defineQuery(`*[
  _type == "curator"
  && slug.current == $slug
][0] {
  _id,
  name,
  slug,
  bio,
  photo {
    asset->{
      url
    },
    alt
  },
  "exhibitions": *[_type == "exhibition" && references(^._id)] | order(startDate desc) [0...8] {
    _id,
    title,
    slug,
    startDate,
    endDate,
    gallery->{
      name,
      city
    }
  }
}`)
