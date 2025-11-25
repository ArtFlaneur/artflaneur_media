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

// Posts queries
export const POSTS_QUERY = defineQuery(`*[
  _type == "post"
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
  categories[]->{
    _id,
    title,
    slug
  },
  publishedAt
}`)

export const POST_QUERY = defineQuery(`*[
  _type == "post"
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
  body,
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
  categories[]->{
    _id,
    title,
    slug
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
  mainImage {
    asset->{
      url
    },
    alt
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
  mainImage {
    asset->{
      url
    },
    alt
  },
  images[] {
    asset->{
      url
    },
    alt,
    caption
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
][0] {
  _id,
  heroTitle,
  heroSubtitle,
  featuredReviews[]->{
    _id,
    title,
    slug,
    excerpt,
    mainImage {
      asset->{
        url
      },
      alt
    },
    rating
  },
  featuredExhibitions[]->{
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

// Authors query
export const AUTHORS_QUERY = defineQuery(`*[
  _type == "author"
] | order(name asc) {
  _id,
  name,
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
  title,
  city,
  description,
  coverImage {
    asset->{
      url
    }
  },
  stops[] {
    _key,
    title,
    description,
    location {
      lat,
      lng
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
  coverImage {
    asset->{
      url
    }
  },
  stops[] {
    _key,
    title,
    description,
    location {
      lat,
      lng
    },
    gallery->{
      _id,
      name,
      address
    }
  }
}`)

