import {defineField, defineType} from 'sanity'

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
        {
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
        },
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
      name: 'isSponsored',
      title: 'Sponsored Content',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'sponsor',
      title: 'Sponsor',
      type: 'reference',
      to: [{type: 'sponsor'}],
      hidden: ({document}) => !document?.isSponsored,
    }),
    defineField({
      name: 'sponsorBadgeSettings',
      title: 'Sponsor Badge Settings',
      type: 'object',
      hidden: ({document}) => !document?.isSponsored,
      fields: [
        {name: 'template', type: 'string', title: 'Badge Template', options: {list: [{title: 'Use sponsor default', value: 'default'}, {title: 'Supported by {logo}', value: 'supportedBy'}]}},
        {name: 'placement', type: 'string', title: 'Placement', options: {list: [{title: 'Top', value: 'top'}, {title: 'Bottom', value: 'bottom'}]}, initialValue: 'top'},
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'coverImage',
      isSponsored: 'isSponsored',
    },
    prepare(selection) {
      const {title, media, isSponsored} = selection
      return {
        title: `${isSponsored ? '💰 ' : ''}${title}`,
        media: media,
      }
    },
  },
})