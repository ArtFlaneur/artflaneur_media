import {EarthGlobeIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import GraphqlGalleryInput from './GraphqlGalleryInput'

export const guide = defineType({
  name: 'guide',
  title: 'Guide',
  type: 'document',
  icon: EarthGlobeIcon,
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
      fields: [defineField({name: 'alt', type: 'string', title: 'Alt text'})],
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
            defineField({name: 'notes', type: 'text', title: 'Notes', rows: 2}),
            defineField({name: 'address', type: 'string', title: 'Address'}),
            defineField({
              name: 'location',
              type: 'geopoint',
              title: 'Map Location',
            }),
            defineField({
              name: 'image',
              type: 'image',
              title: 'Image',
              options: {hotspot: true},
              fields: [defineField({name: 'alt', type: 'string', title: 'Alt text'})],
            }),
            defineField({
              name: 'gallery',
              type: 'reference',
              title: 'Sanity Gallery',
              to: [{type: 'gallery'}],
              description: 'Reference an editorially managed gallery',
              validation: (Rule) => [
                Rule.custom((value, context) => {
                  const externalGallery = (context.parent as any)?.externalGallery
                  if (!value && !externalGallery?.id) {
                    return 'Link a Sanity gallery or choose one from the GraphQL catalogue'
                  }
                  return true
                }).error('Required when an external gallery is not provided'),
              ],
            }),
            defineField({
              name: 'externalGallery',
              title: 'GraphQL Gallery',
              type: 'externalGalleryReference',
              description: 'Optional gallery pulled from the global AppSync catalogue',
              options: {collapsible: true, collapsed: true},
              components: {input: GraphqlGalleryInput},
              validation: (Rule) => [
                Rule.custom((value, context) => {
                  const hasReference = Boolean((context.parent as any)?.gallery)
                  if (!value && !hasReference) {
                    return 'Select a gallery via the lookup or reference an existing one'
                  }
                  return true
                }).error('GraphQL gallery is required when no Sanity gallery is referenced'),
              ],
            }),
            defineField({
              name: 'exhibition',
              type: 'reference',
              title: 'Exhibition',
              to: [{type: 'exhibition'}],
            }),
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
      city: 'city',
      media: 'coverImage',
      stops: 'stops',
    },
    prepare(selection) {
      const {title, city, media, stops} = selection as {
        title?: string
        city?: string
        media?: any
        stops?: unknown
      }
      const stopCount = Array.isArray(stops) ? stops.length : 0
      const subtitleParts = [city, stopCount ? `${stopCount} stops` : null].filter(Boolean)

      return {
        title: title || 'Untitled guide',
        subtitle: subtitleParts.join(' • ') || 'Guide draft',
        media,
      }
    },
  },
})
