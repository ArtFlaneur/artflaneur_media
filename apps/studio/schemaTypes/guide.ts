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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {name: 'alt', type: 'string', title: 'Alt text'},
      ],
    }),
    defineField({
      name: 'introduction',
      title: 'Introduction',
      type: 'blockContent',
    }),
    defineField({
      name: 'locations',
      title: 'Locations',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            {name: 'image', type: 'image', title: 'Image', options: {hotspot: true}},
            {name: 'title', type: 'string', title: 'Title'},
            {name: 'description', type: 'text', title: 'Description', rows: 3},
            {name: 'gallery', type: 'reference', to: [{type: 'gallery'}], title: 'Gallery'},
            {name: 'artEvent', type: 'reference', to: [{type: 'artEvent'}], title: 'Art Event'},
            {name: 'address', type: 'string', title: 'Address'},
            {name: 'workingHours', type: 'text', title: 'Working Hours', rows: 2},
          ],
        }),
      ],
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