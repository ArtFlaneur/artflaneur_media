import {defineArrayMember, defineField, defineType} from 'sanity'
import {CalendarIcon, CheckmarkCircleIcon, DocumentIcon, DocumentTextIcon, StarIcon} from '@sanity/icons'
import {appCtaField, schemaMarkupField, seoField, slugField, summaryField} from './fields/commonFields'
import {workflowFields} from './fields/publishWorkflowField'
import {sponsorshipField} from './fields/sponsorshipField'
import GraphqlExhibitionInput from './review/GraphqlExhibitionInput'

export const review = defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'content', title: 'Content', icon: DocumentTextIcon, default: true},
    {name: 'workflow', title: 'Workflow', icon: CheckmarkCircleIcon},
    {name: 'exhibition', title: 'Exhibition', icon: CalendarIcon},
    {name: 'metadata', title: 'SEO & Metadata', icon: DocumentIcon},
    {name: 'sponsorship', title: 'Sponsorship', icon: StarIcon},
  ],
  fields: [
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
      description: 'Add 2-8 images for the hero slider on homepage and review page. If empty, only mainImage will be shown.',
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
      validation: (Rule) => [
        Rule.max(8).warning('Limit to 8 images to keep the page fast'),
      ],
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
      group: 'content',
      validation: (Rule) => [Rule.required().error('Body content is required')],
    }),
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
    defineField({
      name: 'externalExhibition',
      title: 'GraphQL Exhibition',
      type: 'externalExhibitionReference',
      group: 'exhibition',
      description: 'Search and select an exhibition from the global GraphQL catalogue',
      components: {input: GraphqlExhibitionInput},
      validation: (Rule) => [
        Rule.required().error('Select an exhibition from the GraphQL catalogue to publish'),
      ],
    }),
    defineField({
      name: 'relatedReviews',
      title: 'Related Reviews',
      type: 'array',
      group: 'exhibition',
      of: [defineArrayMember({type: 'reference', to: [{type: 'review'}]})],
      validation: (Rule) => [
        Rule.unique().error('Choose each related review only once'),
        Rule.custom((value, context) => {
          if (!Array.isArray(value)) return true
          const currentId = (context.document as {_id?: string} | undefined)?._id?.replace('drafts.', '')
          const hasSelfReference = value.some((ref) => {
            if (!ref || typeof ref !== 'object') return false
            const referenceId = typeof (ref as {_ref?: unknown})._ref === 'string'
              ? (ref as {_ref: string})._ref.replace('drafts.', '')
              : undefined
            return Boolean(referenceId && referenceId === currentId)
          })
          if (hasSelfReference) {
            return 'A review cannot reference itself'
          }
          return true
        }),
      ],
    }),
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
      author: 'author.name',
      media: 'mainImage',
      sponsorshipEnabled: 'sponsorship.enabled',
      sponsorName: 'sponsorship.sponsor->name',
      status: 'publishStatus',
    },
    prepare({title, author, media, sponsorshipEnabled, sponsorName, status}) {
      const sponsorLabel = sponsorshipEnabled ? `💰 ${sponsorName || 'Sponsored'}` : author || 'No author'
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

      return {
        title: `${statusEmoji ? `${statusEmoji} ` : ''}${title}`.trim(),
        subtitle: sponsorLabel,
        media,
      }
    },
  },
})
