// CRM schemas
import {article} from './article'
import {review} from './review'
import {author} from './author'
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
import {externalArtistReference} from './externalArtistReference'

// Old schemas (if needed)
// import category from './category'
// import post from './post'

export const schemaTypes = [
  blockContent,
  factTable,
  keyInsights,
  sponsor,
  article, // New unified article type
  review, // Keep temporarily for migration
  author,
  artistStory,
  guide,
  landingPage,
  homepageContent,
  siteSettings,
  externalGalleryReference,
  externalExhibitionReference,
  externalArtistReference,
]
