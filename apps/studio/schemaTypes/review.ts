import {defineArrayMember, defineField, defineType} from 'sanity'
import {CalendarIcon, DocumentTextIcon, StarIcon} from '@sanity/icons'
import {appCtaField, schemaMarkupField, seoField, slugField, summaryField} from './fields/commonFields'
import {editorialWorkflowField, publishWorkflowFields} from './fields/publishWorkflowField'
import {sponsorshipField} from './fields/sponsorshipField'
import GraphqlExhibitionInput from './review/GraphqlExhibitionInput'

export const review = defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'content', title: 'Content', icon: DocumentTextIcon, default: true},
    {name: 'editorial', title: 'Editorial Workflow', icon: DocumentTextIcon},
    {name: 'exhibition', title: 'Exhibition', icon: CalendarIcon},
    {name: 'metadata', title: 'SEO & Metadata', icon: DocumentTextIcon},
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
      name: 'excerpt',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Optional teaser for cards and SEO (summary already feeds AI)',
      validation: (Rule) => [Rule.max(200).warning('Excerpts work best under 200 characters')],
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
        defineField({name: 'caption', type: 'string'}),
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
    {
      ...editorialWorkflowField(),
      group: 'editorial',
    },
    ...publishWorkflowFields().map((field) => ({
      ...field,
      group: 'editorial',
    })),
    defineField({
      name: 'author',
      type: 'reference',
      to: [{type: 'author'}],
      group: 'editorial',
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
      rating: 'rating',
      status: 'editorialStatus',
    },
    prepare({title, author, media, sponsorshipEnabled, sponsorName, rating, status}) {
      const sponsorLabel = sponsorshipEnabled ? `💰 ${sponsorName || 'Sponsored'}` : author || 'No author'
      const stars = rating ? '⭐'.repeat(Math.round(rating)) : ''
      const statusEmoji = status === 'approved' ? '✅' : status === 'needsRevision' ? '⚠️' : '👁️'

      return {
        title: `${statusEmoji} ${title}`,
        subtitle: `${sponsorLabel} ${stars}`.trim(),
        media,
      }
    },
  },
})
