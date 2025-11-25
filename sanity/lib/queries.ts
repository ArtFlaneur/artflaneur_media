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
    photo {
      asset->{
        url
      }
    }
  },
  publishedAt,
  rating
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
    photo {
      asset->{
        url
      }
    },
    bio
  },
  exhibition->{
    _id,
    title,
    gallery->{
      name,
      city
    }
  },
  publishedAt
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
    location
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
    location,
    website,
    openingHours
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
  address,
  location,
  description,
  mainImage {
    asset->{
      url
    },
    alt
  }
}`)

export const GALLERY_QUERY = defineQuery(`*[
  _type == "gallery"
  && slug.current == $slug
][0] {
  _id,
  name,
  slug,
  city,
  address,
  location,
  description,
  website,
  openingHours,
  mainImage {
    asset->{
      url
    },
    alt
  },
  "exhibitions": *[_type == "exhibition" && references(^._id)] | order(startDate desc) [0...10] {
    _id,
    title,
    slug,
    startDate,
    endDate
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

export const ARTIST_QUERY = defineQuery(`*[
  _type == "artist"
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
      artist->{
        _id,
        name,
        slug
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
    artist->{
      _id,
      name,
      slug
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
  social
}`)
