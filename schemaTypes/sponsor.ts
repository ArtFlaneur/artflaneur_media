import {defineType, defineField} from 'sanity'
import {HeartIcon} from '@sanity/icons'

export const sponsor = defineType({
  name: 'sponsor',
  type: 'document',
  icon: HeartIcon,
  groups: [
    {name: 'basic', title: 'Basic Info', default: true},
    {name: 'logos', title: 'Logo Variations'},
    {name: 'branding', title: 'Branding'},
  ],
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      group: 'basic',
      validation: (Rule) => Rule.required().error('Sponsor name is required'),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'basic',
      options: {source: 'name'},
      validation: (Rule) => Rule.required().error('Slug is required to generate URLs'),
    }),
    defineField({
      name: 'logo',
      type: 'image',
      group: 'basic',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          validation: (Rule) => Rule.required().error('Alt text required for accessibility'),
        }),
      ],
      validation: (Rule) => Rule.required().error('Logo is required'),
    }),
    defineField({
      name: 'website',
      type: 'url',
      group: 'basic',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      group: 'basic',
    }),
    defineField({
      name: 'logos',
      type: 'object',
      group: 'logos',
      description: 'Different logo variations for different placements',
      fields: [
        defineField({
          name: 'horizontal',
          type: 'object',
          description: 'Best for header/footer placement',
          fields: [
            defineField({
              name: 'image',
              type: 'image',
              options: {hotspot: true},
              validation: (Rule) => Rule.required().error('Horizontal logo is required'),
            }),
            defineField({name: 'alt', type: 'string'}),
            defineField({
              name: 'maxWidth',
              type: 'number',
              description: 'Maximum width in pixels',
              initialValue: 200,
              validation: (Rule) => Rule.min(20).max(500),
            }),
            defineField({
              name: 'maxHeight',
              type: 'number',
              description: 'Maximum height in pixels',
              initialValue: 40,
              validation: (Rule) => Rule.min(20).max(200),
            }),
          ],
          fieldsets: [{name: 'size', title: 'Dimensions', options: {columns: 2}}],
          preview: {
            select: {
              media: 'image',
              width: 'maxWidth',
              height: 'maxHeight',
            },
            prepare({media, width, height}) {
              return {
                title: 'Horizontal Logo',
                subtitle: `${width}×${height}px`,
                media,
              }
            },
          },
        }),
        defineField({
          name: 'vertical',
          type: 'object',
          description: 'Best for sidebar placement',
          fields: [
            defineField({
              name: 'image',
              type: 'image',
              options: {hotspot: true},
            }),
            defineField({name: 'alt', type: 'string'}),
            defineField({
              name: 'maxWidth',
              type: 'number',
              initialValue: 100,
              validation: (Rule) => Rule.min(20).max(300),
            }),
            defineField({
              name: 'maxHeight',
              type: 'number',
              initialValue: 80,
              validation: (Rule) => Rule.min(20).max(300),
            }),
          ],
          fieldsets: [{name: 'size', options: {columns: 2}}],
        }),
        defineField({
          name: 'square',
          type: 'object',
          description: 'Best for small badges',
          fields: [
            defineField({
              name: 'image',
              type: 'image',
              options: {hotspot: true},
            }),
            defineField({name: 'alt', type: 'string'}),
            defineField({
              name: 'size',
              type: 'number',
              description: 'Width and height (square)',
              initialValue: 60,
              validation: (Rule) => Rule.min(20).max(150),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'brandColor',
      type: 'color',
      group: 'branding',
      description: 'Primary brand color for sponsored badges',
    }),
    defineField({
      name: 'defaultBadgeTemplate',
      type: 'string',
      group: 'branding',
      options: {
        list: [
          {title: 'Supported by {logo}', value: 'supportedBy'},
          {title: 'In partnership with {logo}', value: 'partnershipWith'},
          {title: 'Presented by {logo}', value: 'presentedBy'},
          {title: '{logo} presents', value: 'presents'},
        ],
      },
      description: 'Default template (can be overridden per article)',
    }),
    defineField({
      name: 'customDisclaimer',
      type: 'text',
      rows: 2,
      group: 'branding',
      description: 'Default disclaimer (optional)',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'logo',
      website: 'website',
    },
    prepare({title, media, website}) {
      return {
        title,
        subtitle: website,
        media,
      }
    },
  },
})
