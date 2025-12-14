import {defineArrayMember, defineField, defineType} from 'sanity'

export const guide = defineType({
  name: 'guide',
  title: 'Guide',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => [Rule.required().error('Title is required to publish a guide')],
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
      name: 'city',
      title: 'City',
      type: 'string',
      description: 'Primary city covered by this weekend guide',
      validation: (Rule) => [Rule.required().error('City name is required to publish a guide')],
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({name: 'alt', type: 'string', title: 'Alt text'}),
      ],
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 4,
      validation: (Rule) => [
        Rule.required().error('Add a short description to help users understand the trail'),
      ],
    }),
    defineField({
      name: 'stops',
      title: 'Stops',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              title: 'Stop Title',
              validation: (Rule) => [Rule.required().error('Stop title is required')],
            }),
            defineField({name: 'summary', type: 'text', title: 'Summary', rows: 3}),
            defineField({name: 'gallery', type: 'reference', title: 'Gallery', to: [{type: 'gallery'}]}),
            defineField({name: 'exhibition', type: 'reference', title: 'Exhibition', to: [{type: 'exhibition'}]}),
            defineField({name: 'location', type: 'geopoint', title: 'Map Location'}),
            defineField({name: 'address', type: 'string', title: 'Address'}),
            defineField({
              name: 'image',
              type: 'image',
              title: 'Image',
              options: {hotspot: true},
              fields: [defineField({name: 'alt', type: 'string', title: 'Alt text'})],
            }),
            defineField({name: 'notes', type: 'text', title: 'Notes', rows: 2}),
          ],
        }),
      ],
      validation: (Rule) => [Rule.min(1).warning('Add at least one stop to publish the guide')],
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Text',
      type: 'string',
      initialValue: 'Save Places',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
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
            ],
            layout: 'radio',
          },
          initialValue: 'default',
        },
        {
          name: 'placement',
          type: 'string',
          title: 'Placement',
          options: {
            list: [
              {title: 'Top', value: 'top'},
              {title: 'Bottom', value: 'bottom'},
            ],
            layout: 'radio',
          },
          initialValue: 'top',
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'coverImage',
      sponsorshipStatus: 'sponsorshipStatus',
    },
    prepare(selection) {
      const {title, media, sponsorshipStatus} = selection
      return {
        title: `${sponsorshipStatus === 'sponsored' ? '💰 ' : ''}${title}`,
        media: media,
      }
    },
  },
})