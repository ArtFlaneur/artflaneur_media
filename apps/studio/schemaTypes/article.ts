import {defineArrayMember, defineField, defineType} from 'sanity'
import {
  CalendarIcon,
  CheckmarkCircleIcon,
  DocumentIcon,
  DocumentTextIcon,
  StarIcon,
  BookIcon,
  PlayIcon,
} from '@sanity/icons'
import {appCtaField, schemaMarkupField, seoField, slugField, summaryField} from './fields/commonFields'
import {workflowFields} from './fields/publishWorkflowField'
import {sponsorshipField} from './fields/sponsorshipField'
import GraphqlExhibitionInput from './review/GraphqlExhibitionInput'

const contentTypes = [
  {title: '🎨 Exhibition Review', value: 'exhibition-review'},
  {title: '📰 News', value: 'news'},
  {title: '📚 Book Review', value: 'book-review'},
  {title: '🎬 Film Review', value: 'film-review'},
]

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'content', title: 'Content', icon: DocumentTextIcon, default: true},
    {name: 'workflow', title: 'Workflow', icon: CheckmarkCircleIcon},
    {name: 'typeSpecific', title: 'Type-Specific', icon: CalendarIcon},
    {name: 'metadata', title: 'SEO & Metadata', icon: DocumentIcon},
    {name: 'sponsorship', title: 'Sponsorship', icon: StarIcon},
  ],
  fields: [
    defineField({
      name: 'contentType',
      title: 'Content Type',
      type: 'string',
      group: 'content',
      description: 'Determines the category and URL structure for this article',
      options: {
        list: contentTypes,
        layout: 'radio',
      },
      validation: (Rule) => [Rule.required().error('Select a content type before publishing')],
    }),
    defineField({
      name: 'title',
      type: 'string',
      group: 'content',
      validation: (Rule) => [
        Rule.required().error('Title is required to publish'),
        Rule.max(100).warning('Keep titles under 100 characters for better SEO'),
      ],
    }),
    slugField({group: 'content'}),
    summaryField({group: 'content'}),
    defineField({
      name: 'mainImage',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      description: 'Primary hero image used for cards, detail pages, and social previews',
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Required for SEO and accessibility',
          validation: (Rule) => [Rule.required().error('Alt text is required for accessibility')],
        }),
      ],
      validation: (Rule) => [Rule.required().error('A lead image is required before publishing')],
    }),
    defineField({
      name: 'heroSlider',
      title: 'Hero Slider Images',
      type: 'array',
      group: 'content',
      description: 'Add 2-8 images for the hero slider. If empty, only mainImage will be shown.',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alt text',
              validation: (Rule) => [Rule.required().error('Provide alt text for every image')],
            }),
            defineField({name: 'caption', type: 'string', title: 'Caption'}),
          ],
        }),
      ],
      validation: (Rule) => [Rule.max(8).warning('Limit to 8 images to keep the page fast')],
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
      group: 'content',
      validation: (Rule) => [Rule.required().error('Body content is required')],
    }),

    // Workflow fields
    ...workflowFields().map((field) => ({
      ...field,
      group: 'workflow',
    })),
    defineField({
      name: 'author',
      type: 'reference',
      to: [{type: 'author'}],
      group: 'workflow',
      validation: (Rule) => [Rule.required().error('Author is required')],
    }),

    // Exhibition Review specific fields
    defineField({
      name: 'externalExhibition',
      title: 'GraphQL Exhibition',
      type: 'externalExhibitionReference',
      group: 'typeSpecific',
      description: 'Required for exhibition reviews - search and select from GraphQL catalogue',
      components: {input: GraphqlExhibitionInput},
      hidden: ({document}) => document?.contentType !== 'exhibition-review',
      validation: (Rule) => [
        Rule.custom((value, context) => {
          const contentType = (context.document as {contentType?: string} | undefined)?.contentType
          if (contentType === 'exhibition-review' && !value) {
            return 'Exhibition reviews must reference an exhibition from the GraphQL catalogue'
          }
          return true
        }),
      ],
    }),
    defineField({
      name: 'externalExhibition',
      title: 'GraphQL Exhibition',
      type: 'externalExhibitionReference',
      group: 'typeSpecific',
      description: 'Search and select an exhibition from the global GraphQL catalogue',
      hidden: ({document}) => document?.contentType !== 'exhibition-review',
      components: {input: GraphqlExhibitionInput},
      validation: (Rule) => [
        Rule.custom((value, context) => {
          const contentType = (context.document as {contentType?: string} | undefined)?.contentType
          if (contentType === 'exhibition-review' && !value) {
            return 'Select an exhibition from the GraphQL catalogue for exhibition reviews'
          }
          return true
        }),
        Rule.min(1).max(5).error('Rating must be between 1 and 5'),
        Rule.precision(1),
      ],
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Related Articles',
      type: 'array',
      group: 'typeSpecific',
      description: 'Link to related articles of any type',
      of: [defineArrayMember({type: 'reference', to: [{type: 'article'}]})],
      hidden: ({document}) => document?.contentType !== 'exhibition-review',
      validation: (Rule) => [
        Rule.unique().error('Choose each related article only once'),
        Rule.custom((value, context) => {
          if (!Array.isArray(value)) return true
          const currentId = (context.document as {_id?: string} | undefined)?._id?.replace(
            'drafts.',
            '',
          )
          const hasSelfReference = value.some((ref) => {
            if (!ref || typeof ref !== 'object') return false
            const referenceId =
              typeof (ref as {_ref?: unknown})._ref === 'string'
                ? (ref as {_ref: string})._ref.replace('drafts.', '')
                : undefined
            return Boolean(referenceId && referenceId === currentId)
          })
          if (hasSelfReference) {
            return 'An article cannot reference itself'
          }
          return true
        }),
      ],
    }),

    // News specific fields
    defineField({
      name: 'newsDate',
      title: 'News Date',
      type: 'datetime',
      group: 'typeSpecific',
      description: 'Original publication date of the news',
      hidden: ({document}) => document?.contentType !== 'news',
      validation: (Rule) => [
        Rule.custom((value, context) => {
          const contentType = (context.document as {contentType?: string} | undefined)?.contentType
          if (contentType === 'news' && !value) {
            return 'News date is required for news articles'
          }
          return true
        }),
      ],
    }),
    defineField({
      name: 'newsSource',
      title: 'News Source',
      type: 'string',
      group: 'typeSpecific',
      description: 'Name of the original news source (e.g., "The Art Newspaper", "Artforum")',
      hidden: ({document}) => document?.contentType !== 'news',
      validation: (Rule) => [
        Rule.custom((value, context) => {
          const contentType = (context.document as {contentType?: string} | undefined)?.contentType
          if (contentType === 'news' && !value) {
            return 'Source is required for news articles'
          }
          return true
        }),
      ],
    }),
    defineField({
      name: 'externalLink',
      title: 'Original Article URL',
      type: 'url',
      group: 'typeSpecific',
      description: 'Link to the original news article',
      hidden: ({document}) => document?.contentType !== 'news',
      validation: (Rule) => [
        Rule.uri({
          scheme: ['http', 'https'],
        }).error('Must be a valid URL starting with http:// or https://'),
      ],
    }),

    // Book Review specific fields
    defineField({
      name: 'bookTitle',
      title: 'Book Title',
      type: 'string',
      group: 'typeSpecific',
      hidden: ({document}) => document?.contentType !== 'book-review',
      validation: (Rule) => [
        Rule.custom((value, context) => {
          const contentType = (context.document as {contentType?: string} | undefined)?.contentType
          if (contentType === 'book-review' && !value) {
            return 'Book title is required for book reviews'
          }
          return true
        }),
      ],
    }),
    defineField({
      name: 'bookAuthor',
      title: 'Book Author',
      type: 'string',
      group: 'typeSpecific',
      hidden: ({document}) => document?.contentType !== 'book-review',
      validation: (Rule) => [
        Rule.custom((value, context) => {
          const contentType = (context.document as {contentType?: string} | undefined)?.contentType
          if (contentType === 'book-review' && !value) {
            return 'Book author is required for book reviews'
          }
          return true
        }),
      ],
    }),
    defineField({
      name: 'publisher',
      title: 'Publisher',
      type: 'string',
      group: 'typeSpecific',
      hidden: ({document}) => document?.contentType !== 'book-review',
    }),
    defineField({
      name: 'publishYear',
      title: 'Publication Year',
      type: 'number',
      group: 'typeSpecific',
      hidden: ({document}) => document?.contentType !== 'book-review',
      validation: (Rule) => [
        Rule.integer().error('Year must be a whole number'),
        Rule.min(1900).max(new Date().getFullYear() + 2).warning('Check the publication year'),
      ],
    }),
    defineField({
      name: 'isbn',
      title: 'ISBN',
      type: 'string',
      group: 'typeSpecific',
      description: 'ISBN-10 or ISBN-13',
      hidden: ({document}) => document?.contentType !== 'book-review',
    }),
    defineField({
      name: 'purchaseLink',
      title: 'Purchase Link',
      type: 'url',
      group: 'typeSpecific',
      description: 'Link to purchase or learn more about the book',
      hidden: ({document}) => document?.contentType !== 'book-review',
      validation: (Rule) => [
        Rule.uri({
          scheme: ['http', 'https'],
        }).error('Must be a valid URL starting with http:// or https://'),
      ],
    }),

    // Film Review specific fields
    defineField({
      name: 'filmReviews',
      title: 'Films In Focus',
      type: 'array',
      group: 'typeSpecific',
      description: 'Add 3-5 films that will render as structured cards on the story page',
      hidden: ({document}) => document?.contentType !== 'film-review',
      of: [defineArrayMember({type: 'filmReviewEntry'})],
      validation: (Rule) => [
        Rule.custom((value, context) => {
          const contentType = (context.document as {contentType?: string} | undefined)?.contentType
          if (contentType !== 'film-review') {
            return true
          }
          if (!Array.isArray(value) || value.length === 0) {
            return 'Film reviews must highlight at least three films'
          }
          if (value.length < 3) {
            return 'Add at least three films to publish this review'
          }
          if (value.length > 5) {
            return 'Limit film reviews to five films to keep the page digestible'
          }
          return true
        }),
      ],
    }),

    // Metadata fields
    defineField({
      name: 'ctaText',
      type: 'string',
      group: 'metadata',
      description: 'Overrides the default CTA from Settings → CTA Defaults',
    }),
    appCtaField({
      group: 'metadata',
      description: 'Optional CTA that deep links readers into the Art Flaneur app',
    }),
    seoField({group: 'metadata'}),
    schemaMarkupField({
      group: 'metadata',
      description: 'Paste JSON-LD or leave blank to populate via automation later',
    }),
    {
      ...sponsorshipField(),
      group: 'sponsorship',
    },
  ],
  preview: {
    select: {
      title: 'title',
      contentType: 'contentType',
      author: 'author.name',
      media: 'mainImage',
      sponsorshipEnabled: 'sponsorship.enabled',
      sponsorName: 'sponsorship.sponsor->name',
      rating: 'rating',
      status: 'publishStatus',
      bookTitle: 'bookTitle',
      filmReviews: 'filmReviews',
      newsSource: 'newsSource',
    },
    prepare({
      title,
      contentType,
      author,
      media,
      sponsorshipEnabled,
      sponsorName,
      rating,
      status,
      bookTitle,
      filmReviews,
      newsSource,
    }) {
      const contentTypeMap: Record<string, string> = {
        'exhibition-review': '🎨',
        'news': '📰',
        'book-review': '📚',
        'film-review': '🎬',
      }

      const typeEmoji = contentType ? contentTypeMap[contentType] ?? '📝' : '📝'

      const statusEmojiMap: Record<string, string> = {
        draft: '📝',
        inReview: '👁️',
        needsRevision: '⚠️',
        approved: '✅',
        scheduled: '🕐',
        published: '🚀',
        archived: '📦',
      }
      const statusEmoji = status ? statusEmojiMap[status] ?? '' : ''

      const sponsorLabel = sponsorshipEnabled ? `💰 ${sponsorName || 'Sponsored'}` : author || 'No author'
      
      const stars = rating && contentType === 'exhibition-review' ? '⭐'.repeat(Math.round(rating)) : ''

      // Show specific content info in subtitle based on type
      let typeInfo = ''
      if (contentType === 'book-review' && bookTitle) {
        typeInfo = ` • ${bookTitle}`
      } else if (contentType === 'film-review') {
        const filmCount = Array.isArray(filmReviews) ? filmReviews.length : 0
        if (filmCount) {
          const firstTitle = (filmReviews?.[0] as {title?: string} | undefined)?.title
          const label = filmCount > 1 ? `${filmCount} films` : firstTitle || 'Film spotlight'
          typeInfo = ` • ${label}`
        }
      } else if (contentType === 'news' && newsSource) {
        typeInfo = ` • ${newsSource}`
      }

      return {
        title: `${statusEmoji ? `${statusEmoji} ` : ''}${typeEmoji} ${title || 'Untitled'}`.trim(),
        subtitle: `${sponsorLabel}${stars ? ` ${stars}` : ''}${typeInfo}`.trim(),
        media,
      }
    },
  },
})
