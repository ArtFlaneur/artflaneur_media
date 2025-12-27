import {defineArrayMember, defineField, defineType} from 'sanity'
import GraphqlArtistInput from './artistStory/GraphqlArtistInput'

export const artistStory = defineType({
  name: 'artistStory',
  title: 'Artist Story',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
          validation: (Rule) => [Rule.required().error('Title is required to publish an artist story')],
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
          validation: (Rule) => [Rule.required().error('Slug is required to generate a URL')],
    }),
    defineField({
      name: 'externalArtist',
      title: 'GraphQL Artist',
      type: 'externalArtistReference',
      description: 'Search the global GraphQL catalogue to lock this story to a canonical artist entry',
      components: {input: GraphqlArtistInput},
      validation: (Rule) => [Rule.required().error('Select an artist from the GraphQL catalogue to publish')],
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      options: {hotspot: true},
      fields: [
            defineField({name: 'alt', type: 'string', title: 'Alt text'}),
      ],
    }),
    defineField({
      name: 'biography',
      title: 'Biography',
      type: 'blockContent',
    }),
    defineField({
      name: 'artworkGallery',
      title: 'Artwork Gallery',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
                defineField({name: 'alt', type: 'string', title: 'Alt text'}),
                defineField({name: 'caption', type: 'string', title: 'Caption'}),
                defineField({name: 'title', type: 'string', title: 'Artwork Title'}),
                defineField({name: 'year', type: 'string', title: 'Year'}),
          ],
        }),
      ],
    }),
    defineField({
      name: 'relatedExhibitions',
      title: 'Related Exhibitions',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'exhibition'}]})],
    }),
    defineField({
      name: 'upcomingExhibitions',
      title: 'Upcoming Exhibitions',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'exhibition'}]})],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),
    defineField({
      name: 'scheduledPublishAt',
      title: 'Schedule Publication',
      type: 'datetime',
      description: 'Schedule this story to be published at a specific date and time',
    }),
    defineField({
      name: 'publishStatus',
      title: 'Publish Status',
      type: 'string',
      options: {
        list: [
          {title: '📝 Draft', value: 'draft'},
          {title: '🕐 Scheduled', value: 'scheduled'},
          {title: '✅ Published', value: 'published'},
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule) => [Rule.required().error('Publishing status must be tracked for artist stories')],
    }),
    defineField({
      name: 'sponsorshipStatus',
      title: 'Sponsored Content',
      type: 'string',
      options: {
        list: [
          {title: 'Not Sponsored', value: 'notSponsored'},
          {title: 'Sponsored Content', value: 'sponsored'},
        ],
        layout: 'radio',
      },
      initialValue: 'notSponsored',
    }),
    defineField({
      name: 'sponsor',
      title: 'Sponsor',
      type: 'reference',
      to: [{type: 'sponsor'}],
      hidden: ({document}) => document?.sponsorshipStatus !== 'sponsored',
          validation: (Rule) => [Rule.custom((sponsor, context) => {
        const isSponsored = (context.document as any)?.sponsorshipStatus === 'sponsored'
        if (isSponsored && !sponsor) {
          return 'Please select a sponsor for sponsored content'
        }
        return true
          })],
    }),
    defineField({
      name: 'sponsorBadgeSettings',
      title: 'Sponsor Badge Settings',
      type: 'object',
      hidden: ({document}) => document?.sponsorshipStatus !== 'sponsored',
      fields: [
        {
          name: 'template',
          type: 'string',
          title: 'Badge Template',
          options: {
            list: [
              {title: 'Use sponsor default', value: 'default'},
              {title: 'Supported by {logo}', value: 'supportedBy'},
              {title: 'In partnership with {logo}', value: 'partnershipWith'},
              {title: 'Custom text', value: 'custom'},
            ],
            layout: 'radio',
          },
          initialValue: 'default',
        },
        {
          name: 'customText',
          type: 'string',
          title: 'Custom Badge Text',
          description: 'Use {logo} as placeholder',
          hidden: ({parent}) => parent?.template !== 'custom',
        },
        {
          name: 'placement',
          type: 'string',
          title: 'Badge Placement',
          options: {
            list: [
              {title: 'Top', value: 'top'},
              {title: 'After title', value: 'afterTitle'},
              {title: 'Bottom', value: 'bottom'},
            ],
            layout: 'radio',
          },
          initialValue: 'afterTitle',
        },
        {
          name: 'style',
          type: 'string',
          title: 'Badge Style',
          options: {
            list: [
              {title: 'Default', value: 'default'},
              {title: 'Subtle', value: 'subtle'},
              {title: 'Bold', value: 'bold'},
            ],
            layout: 'radio',
          },
          initialValue: 'default',
        },
        {
          name: 'logoOrientation',
          type: 'string',
          title: 'Logo Orientation',
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
        },
        {
          name: 'customLogoSize',
          type: 'object',
          title: 'Custom Logo Size',
          fields: [
            defineField({
              name: 'mode',
              type: 'string',
              title: 'Sizing Mode',
              options: {
                list: [
                  {title: 'Use default size', value: 'default'},
                  {title: 'Custom size', value: 'custom'},
                ],
                layout: 'radio',
              },
              initialValue: 'default',
            }),
            defineField({
              name: 'maxWidth',
              type: 'number',
              title: 'Max Width (px)',
              hidden: ({parent}) => parent?.mode !== 'custom',
              validation: (Rule) => [Rule.min(20).max(500)],
            }),
            defineField({
              name: 'maxHeight',
              type: 'number',
              title: 'Max Height (px)',
              hidden: ({parent}) => parent?.mode !== 'custom',
              validation: (Rule) => [Rule.min(20).max(200)],
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      artist: 'externalArtist.name',
      media: 'portrait',
      sponsorshipStatus: 'sponsorshipStatus',
    },
    prepare(selection) {
      const {artist, sponsorshipStatus} = selection
      const sponsorLabel = sponsorshipStatus === 'sponsored' ? '💰 ' : ''
      return {...selection, subtitle: `${sponsorLabel}${artist || 'No artist'}`}
    },
  },
})