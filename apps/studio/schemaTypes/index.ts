// CRM schemas
import {article} from './article'
import {review} from './review'
import {author} from './author'
import {blockContent} from './blockContent'
import {factTable} from './factTable'
import {keyInsights} from './keyInsights'
import {imageSliderBlock} from './imageSliderBlock'
import {artistStory} from './artistStory'
import {guide} from './guide/index'
import {landingPage} from './landingPage'
import {homepageContent} from './homepageContent'
import {siteSettings} from './siteSettings'
import {sponsor} from './sponsor'
import {artEvent} from './artEvent'
import {externalGalleryReference} from './externalGalleryReference'
import {externalExhibitionReference} from './externalExhibitionReference'
import {externalArtistReference} from './externalArtistReference'
import {filmReviewEntry} from './filmReviewEntry'

// Old schemas (if needed)
// import category from './category'
// import post from './post'

export const schemaTypes = [
  blockContent,
  factTable,
  keyInsights,
  imageSliderBlock,
  sponsor,
  article, // New unified article type
  review, // Keep temporarily for migration
  author,
  artistStory,
  artEvent,
  guide,
  landingPage,
  homepageContent,
  siteSettings,
  externalGalleryReference,
  externalExhibitionReference,
  externalArtistReference,
  filmReviewEntry,
]
