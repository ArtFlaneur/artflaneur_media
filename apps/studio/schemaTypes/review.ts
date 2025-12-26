import {defineType, defineField, defineArrayMember} from 'sanity'
import {DocumentTextIcon, StarIcon} from '@sanity/icons'
import {appCtaField, publishDateField, schemaMarkupField, seoField, slugField, summaryField} from './fields/commonFields'
import GraphqlExhibitionInput from './review/GraphqlExhibitionInput'

export const review = defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'content', title: 'Content', icon: DocumentTextIcon, default: true},
    {name: 'editorial', title: 'Editorial', icon: DocumentTextIcon},
    {name: 'sponsorship', title: 'Sponsorship', icon: StarIcon},
    {name: 'metadata', title: 'Metadata', icon: DocumentTextIcon},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'content',
      validation: (Rule) => [
        Rule.required().error('Title is required to publish'),
        Rule.max(100).warning('Titles should be under 100 characters for better SEO'),
      ],
    }),
    slugField({group: 'content'}),
    summaryField({group: 'content'}),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Optional teaser for cards and SEO (summary already feeds AI)',
      validation: (Rule) => [
        Rule.max(200).warning('Excerpts work best under 200 characters'),
      ],
    }),
    defineField({
      name: 'mainImage',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Required for SEO and accessibility',
          validation: (Rule) => [Rule.required().error('Alt text is required for accessibility')],
        }),
      ],
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          validation: (Rule) => [Rule.required().error('Alt text is required')],
        }),
        defineField({
          name: 'caption',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
      group: 'content',
      validation: (Rule) => [Rule.required().error('Body content is required')],
    }),
    defineField({
      name: 'rating',
      type: 'number',
      group: 'content',
      description: '1-5 star rating',
      validation: (Rule) => [
        Rule.min(1).max(5).error('Rating must be between 1 and 5'),
        Rule.precision(1),
      ],
    }),
    defineField({
      name: 'status',
      type: 'string',
      group: 'editorial',
      options: {
        list: [
          {title: 'In Review', value: 'inReview'},
          {title: 'Needs Revision', value: 'needsRevision'},
          {title: 'Approved', value: 'approved'},
        ],
        layout: 'radio',
      },
      initialValue: 'inReview',
      validation: (Rule) => [Rule.required().error('Status is required')],
    }),
    defineField({
      name: 'publishStatus',
      type: 'string',
      group: 'editorial',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Scheduled', value: 'scheduled'},
          {title: 'Published', value: 'published'},
          {title: 'Unpublished', value: 'unpublished'},
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
    }),
    publishDateField({group: 'editorial'}),
    defineField({
      name: 'scheduledPublishAt',
      type: 'datetime',
      group: 'editorial',
      description: 'Schedule for future publication',
    }),
    defineField({
      name: 'author',
      type: 'reference',
      to: [{type: 'author'}],
      group: 'metadata',
      validation: (Rule) => [Rule.required().error('Author is required')],
    }),
    defineField({
      name: 'exhibition',
      type: 'reference',
      to: [{type: 'exhibition'}],
      group: 'metadata',
      description: 'Reference an editorially managed exhibition from Sanity',
      options: {
        filter: 'defined(title)',
      },
      validation: (Rule) => [Rule.custom((exhibition, context) => {
        const externalExhibition = (context.document as any)?.externalExhibition
        const gallery = (context.document as any)?.gallery
        if (!exhibition && !externalExhibition && !gallery) {
          return 'Select an Exhibition (Sanity or GraphQL) or a Gallery'
        }
        return true
      })],
    }),
    defineField({
      name: 'externalExhibition',
      title: 'GraphQL Exhibition',
      type: 'externalExhibitionReference',
      group: 'metadata',
      description: 'Search and select an exhibition from the global GraphQL catalogue',
      components: {input: GraphqlExhibitionInput},
      validation: (Rule) => [Rule.custom((externalExhibition, context) => {
        const exhibition = (context.document as any)?.exhibition
        const gallery = (context.document as any)?.gallery
        if (!externalExhibition && !exhibition && !gallery) {
          return 'Select an Exhibition (Sanity or GraphQL) or a Gallery'
        }
        return true
      })],
    }),
    defineField({
      name: 'gallery',
      type: 'reference',
      to: [{type: 'gallery'}],
      group: 'metadata',
      options: {
        filter: 'defined(name)',
      },
    }),
    defineField({
      name: 'artists',
      type: 'array',
      group: 'metadata',
      of: [defineArrayMember({type: 'reference', to: [{type: 'artist'}]})],
    }),
    defineField({
      name: 'exhibitionDates',
      type: 'object',
      group: 'metadata',
      fields: [
        defineField({name: 'startDate', type: 'datetime'}),
        defineField({name: 'endDate', type: 'datetime'}),
      ],
      fieldsets: [{name: 'dates', options: {columns: 2}}],
    }),
    defineField({
      name: 'venue',
      type: 'object',
      group: 'metadata',
      fields: [
        defineField({name: 'address', type: 'string'}),
        defineField({name: 'workingHours', type: 'text', rows: 2}),
        defineField({name: 'ticketPrice', type: 'string'}),
      ],
    }),
    defineField({
      name: 'relatedReviews',
      type: 'array',
      group: 'metadata',
      of: [defineArrayMember({type: 'reference', to: [{type: 'review'}]})],
    }),
    defineField({
      name: 'ctaText',
      type: 'string',
      group: 'metadata',
      initialValue: 'Add to your Planner',
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
    defineField({
      name: 'sponsorshipEnabled',
      type: 'string',
      group: 'sponsorship',
      options: {
        list: [
          {title: 'Not Sponsored', value: 'no'},
          {title: 'Sponsored Content', value: 'yes'},
        ],
        layout: 'radio',
      },
      initialValue: 'no',
      description: 'Mark this review as sponsored content',
    }),
    defineField({
      name: 'sponsor',
      type: 'reference',
      to: [{type: 'sponsor'}],
      group: 'sponsorship',
      hidden: ({document}) => document?.sponsorshipEnabled !== 'yes',
      validation: (Rule) => [Rule.custom((sponsor, context) => {
        const enabled = (context.document as any)?.sponsorshipEnabled
        if (enabled === 'yes' && !sponsor) {
          return 'Select a sponsor for sponsored content'
        }
        return true
      })],
    }),
    defineField({
      name: 'sponsorshipType',
      type: 'string',
      group: 'sponsorship',
      options: {
        list: [
          {title: 'Paid Article', value: 'paidArticle'},
          {title: 'Partnership', value: 'partnership'},
          {title: 'Affiliate', value: 'affiliate'},
        ],
        layout: 'radio',
      },
      hidden: ({document}) => document?.sponsorshipEnabled !== 'yes',
    }),
    defineField({
      name: 'sponsorBadgeSettings',
      type: 'object',
      group: 'sponsorship',
      hidden: ({document}) => document?.sponsorshipEnabled !== 'yes',
      fields: [
        defineField({
          name: 'template',
          type: 'string',
          options: {
            list: [
              {title: 'Use sponsor default', value: 'default'},
              {title: 'Supported by {logo}', value: 'supportedBy'},
              {title: 'In partnership with {logo}', value: 'partnershipWith'},
              {title: 'Presented by {logo}', value: 'presentedBy'},
              {title: '{logo} presents', value: 'presents'},
              {title: 'Custom text', value: 'custom'},
            ],
          },
          initialValue: 'default',
        }),
        defineField({
          name: 'customText',
          type: 'string',
          description: 'Use {logo} as placeholder',
          placeholder: 'e.g., "Brought to you by {logo}"',
          hidden: ({parent}) => parent?.template !== 'custom',
        }),
        defineField({
          name: 'placement',
          type: 'string',
          options: {
            list: [
              {title: 'Top of article', value: 'top'},
              {title: 'After title', value: 'afterTitle'},
              {title: 'Bottom of article', value: 'bottom'},
              {title: 'Sidebar', value: 'sidebar'},
            ],
            layout: 'radio',
          },
          initialValue: 'afterTitle',
        }),
        defineField({
          name: 'style',
          type: 'string',
          options: {
            list: [
              {title: 'Use global default', value: 'default'},
              {title: 'Subtle', value: 'subtle'},
              {title: 'Bold', value: 'bold'},
              {title: 'Minimal', value: 'minimal'},
              {title: 'Card', value: 'card'},
            ],
          },
          initialValue: 'default',
        }),
        defineField({
          name: 'logoOrientation',
          type: 'string',
          options: {
            list: [
              {title: 'Auto', value: 'auto'},
              {title: 'Horizontal', value: 'horizontal'},
              {title: 'Vertical', value: 'vertical'},
              {title: 'Square', value: 'square'},
            ],
            layout: 'radio',
          },
          initialValue: 'auto',
        }),
        defineField({
          name: 'customLogoSize',
          type: 'object',
          description: 'Override default logo size',
          fields: [
            defineField({
              name: 'enabled',
              type: 'string',
              options: {
                list: [
                  {title: 'Use default size', value: 'no'},
                  {title: 'Custom size', value: 'yes'},
                ],
                layout: 'radio',
              },
              initialValue: 'no',
            }),
            defineField({
              name: 'maxWidth',
              type: 'number',
              hidden: ({parent}) => parent?.enabled !== 'yes',
              validation: (Rule) => [Rule.min(20).max(500)],
            }),
            defineField({
              name: 'maxHeight',
              type: 'number',
              hidden: ({parent}) => parent?.enabled !== 'yes',
              validation: (Rule) => [Rule.min(20).max(200)],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'sponsorDisclaimer',
      type: 'text',
      rows: 2,
      group: 'sponsorship',
      hidden: ({document}) => document?.sponsorshipEnabled !== 'yes',
      description: 'Custom disclaimer (optional)',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
      sponsorshipEnabled: 'sponsorshipEnabled',
      sponsorName: 'sponsor.name',
      rating: 'rating',
      status: 'status',
    },
    prepare({title, author, media, sponsorshipEnabled, sponsorName, rating, status}) {
      const sponsorLabel = sponsorshipEnabled === 'yes' ? `💰 ${sponsorName || 'Sponsored'}` : author || 'No author'
      const stars = rating ? '⭐'.repeat(Math.round(rating)) : ''
      const statusEmoji = status === 'approved' ? '✅' : status === 'needsRevision' ? '⚠️' : '👁️'
      
      return {
        title: `${statusEmoji} ${title}`,
        subtitle: `${sponsorLabel} ${stars}`,
        media,
      }
    },
  },
})
