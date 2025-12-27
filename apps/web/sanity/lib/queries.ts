import { defineQuery } from 'groq'

// Reviews queries
export const REVIEWS_QUERY = defineQuery(`*[
  _type == "review"
  && publishStatus == "published"
] | order(publishedAt desc) [0...10] {
  _id,
  title,
  slug,
  excerpt,
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
  rating,
  externalExhibition {
    _type,
    id,
    title,
    startDate,
    endDate,
    gallery {
      id,
      name,
      city
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
  excerpt,
  mainImage {
    asset->{
      _id,
      url
    },
    alt
  },
  coverImage {
    asset->{
      url
    },
    alt,
    caption
  },
  body,
  rating,
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
  artists[]->{
    _id,
    name,
    slug
  },
  gallery->{
    _id,
    name,
    slug,
    city,
    address,
    website,
    supabaseId,
    graphqlId
  },
  exhibition->{
    _id,
    title,
    slug,
    supabaseId,
    graphqlId,
    gallery->{
      _id,
      name,
      slug,
      city,
      address,
      website,
      supabaseId,
      graphqlId
    },
    artists[]->{
      _id,
      name,
      slug
    },
    curators[]->{
      _id,
      name,
      slug
    }
  },
  externalExhibition {
    _type,
    id,
    title,
    startDate,
    endDate,
    gallery {
      id,
      name,
      city
    }
  },
  sponsorshipEnabled,
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
  },
  sponsorBadgeSettings{
    template,
    customText,
    placement,
    style
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
  excerpt,
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
  publishedAt,
  rating
}`)

// Exhibitions queries
export const EXHIBITIONS_QUERY = defineQuery(`*[
  _type == "exhibition"
  && defined(startDate)
] | order(startDate desc) [0...20] {
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
    "location": coalesce(location, geopoint)
  },
  artists[]->{
    _id,
    name,
    slug
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
    excerpt,
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

// Homepage content query
export const HOMEPAGE_QUERY = defineQuery(`*[
  _type == "homepageContent"
  && !(_id in path("drafts.**"))
][0] {
  _id,
  title,
  heroSection{
    featuredReview->{
      _id,
      title,
      slug,
      excerpt,
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
    weeklyStory->{
      _id,
      title,
      slug,
      excerpt,
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
    excerpt,
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
    sponsorshipStatus,
    sponsor->{
      _id,
      name,
      logo{
        asset->{
          url
        }
      }
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
  social,
  tickerMessages[]{
    message,
    isActive
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
] | order(_createdAt desc) {
  _id,
  slug,
  title,
  city,
  description,
  coverImage {
    asset->{
      url
    },
    alt
  },
  ctaText,
  sponsorshipStatus,
  sponsor->{
    _id,
    name,
    logo {
      asset->{
        url
      }
    }
  },
  stops[] {
    _key,
    title,
    summary,
    notes,
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

// Guide query (single)
export const GUIDE_QUERY = defineQuery(`*[
  _type == "guide"
  && slug.current == $slug
][0] {
  _id,
  title,
  city,
  description,
  ctaText,
  sponsorshipStatus,
  sponsor->{
    _id,
    name,
    logo {
      asset->{
        url
      }
    }
  },
  sponsorBadgeSettings{
    template,
    placement
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
    excerpt,
    mainImage {
      asset->{
        url
      },
      alt
    }
  }
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
