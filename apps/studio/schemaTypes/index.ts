// CRM schemas
import {exhibition} from './exhibition'
import {review} from './review'
import {author} from './author'
import {gallery} from './gallery'
import {curator} from './curator'
import {artist} from './artist'
import {blockContent} from './blockContent'
import {factTable} from './factTable'
import {keyInsights} from './keyInsights'
import {artistStory} from './artistStory'
import {guide} from './guide/index'
import {landingPage} from './landingPage'
import {homepageContent} from './homepageContent'
import {siteSettings} from './siteSettings'
import {sponsor} from './sponsor'
import {externalGalleryReference} from './externalGalleryReference'
import {externalExhibitionReference} from './externalExhibitionReference'

// Old schemas (if needed)
// import category from './category'
// import post from './post'

export const schemaTypes = [
  blockContent,
  factTable,
  keyInsights,
  sponsor,
  exhibition,
  review,
  author,
  gallery,
  curator,
  artist,
  artistStory,
  guide,
  landingPage,
  homepageContent,
  siteSettings,
  externalGalleryReference,
  externalExhibitionReference,
]
