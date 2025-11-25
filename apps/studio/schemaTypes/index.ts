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
import {landingPage} from './landingPage'
import {homepageContent} from './homepageContent'
import {mapData} from './mapData'
import {siteSettings} from './siteSettings'
import {sponsor} from './sponsor'

// Old schemas (if needed)
// import category from './category'
// import post from './post'

export const schemaTypes = [
  blockContent,
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
  mapData,
  siteSettings,
]
