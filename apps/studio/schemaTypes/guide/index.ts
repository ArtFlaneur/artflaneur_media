import {CheckmarkCircleIcon, DocumentIcon, EarthGlobeIcon, StarIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType, type PreviewValue} from 'sanity'
import {appCtaField, schemaMarkupField, seoField, slugField, summaryField} from '../fields/commonFields'
import {workflowFields} from '../fields/publishWorkflowField'
import {sponsorshipField} from '../fields/sponsorshipField'
import GraphqlGalleryInput from './GraphqlGalleryInput'

export const guide = defineType({
  name: 'guide',
  title: 'Guide',
  type: 'document',
  icon: EarthGlobeIcon,
  groups: [
    {name: 'content', title: 'Content', default: true, icon: EarthGlobeIcon},
    {name: 'publishing', title: 'Workflow', icon: CheckmarkCircleIcon},
    {name: 'metadata', title: 'SEO & Metadata', icon: DocumentIcon},
    {name: 'sponsorship', title: 'Sponsorship', icon: StarIcon},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => [Rule.required().error('Title is required to publish a guide')],
    }),
    slugField({group: 'content'}),
    summaryField({group: 'content'}),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      group: 'content',
      description: 'Primary city covered by this guide',
      validation: (Rule) => [Rule.required().error('City name is required to publish a guide')],
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      description: 'Hero image for the guide hero and cards',
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          description: 'Describe the scene or location for accessibility',
          validation: (Rule) => [Rule.required().error('Alt text is required')],
        }),
      ],
      validation: (Rule) => [Rule.required().error('Cover image is required for guides')],
    }),
    defineField({
      name: 'appScreenshot',
      title: 'App Map Screenshot',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      description: 'Screenshot of this trail in the mobile app (shown in sidebar)',
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          description: 'Describe what is shown in the screenshot',
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Guide Introduction',
      type: 'blockContent',
      group: 'content',
      description: 'Optional editorial context before the stops',
    }),
    defineField({
      name: 'stops',
      title: 'Stops',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'externalGallery',
              title: 'GraphQL Gallery',
              type: 'externalGalleryReference',
              description: 'Search the global GraphQL catalogue for this stop',
              options: {collapsible: true, collapsed: true},
              components: {input: GraphqlGalleryInput},
              validation: (Rule) => [
                Rule.required().error('Select a gallery via the GraphQL lookup for every stop'),
              ],
            }),
            defineField({
              name: 'title',
              type: 'string',
              title: 'Stop Title (Optional)',
              description: 'Leave empty to use gallery name from GraphQL automatically',
            }),
            defineField({name: 'summary', type: 'text', title: 'Summary', rows: 3}),
            defineField({name: 'notes', type: 'text', title: 'Notes', rows: 2}),
            defineField({
              name: 'curatorQuote',
              type: 'text',
              title: 'Curator Recommendation',
              description: 'Optional curator insight or recommendation for this stop',
              rows: 2,
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
      group: 'content',
      description: 'Optional override for Settings → CTA Defaults → Guide CTA',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'author'}],
      group: 'publishing',
      validation: (Rule) => [Rule.required().error('Guides must credit an author')],
    }),
    ...workflowFields().map((field) => ({
      ...field,
      group: 'publishing',
    })),
    seoField({group: 'metadata'}),
    schemaMarkupField({group: 'metadata'}),
    appCtaField({group: 'metadata'}),
    {
      ...sponsorshipField(),
      group: 'sponsorship',
    },
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
        media?: PreviewValue['media']
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
