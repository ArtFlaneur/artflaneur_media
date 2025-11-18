// CRM schemas
import {exhibition} from './exhibition'
import {review} from './review'
import {author} from './author'
import {gallery} from './gallery'
import {curator} from './curator'
import {artist} from './artist'
import {blockContent} from './blockContent'
import {artistStory} from './artistStory'
import {guide} from './guide'
import {artEvent} from './artEvent'
import {landingPage} from './landingPage'
import {homepageContent} from './homepageContent'
import {mapData} from './mapData'
import {siteSettings} from './siteSettings'
import {sponsor} from './sponsor'
import {pageTemplate} from './pageTemplate'

// Old schemas (if needed)
// import category from './category'
// import post from './post'

export const schemaTypes = [
  blockContent,
  pageTemplate,
  sponsor,
  exhibition,
  review,
  author,
  gallery,
  curator,
  artist,
  artistStory,
  guide,
  artEvent,
  landingPage,
  homepageContent,
  mapData,
  siteSettings,
]
