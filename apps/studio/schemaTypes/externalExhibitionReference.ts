import {CalendarIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'
import {workingHoursField} from './fields/workingHoursField'

export const externalExhibitionReference = defineType({
  name: 'externalExhibitionReference',
  title: 'GraphQL Exhibition Reference',
  type: 'object',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'id',
      title: 'GraphQL Exhibition ID',
      type: 'string',
      validation: (Rule) => [Rule.required().error('GraphQL exhibition ID is required')],
    }),
    defineField({name: 'title', title: 'Exhibition Title', type: 'string'}),
    defineField({name: 'startDate', title: 'Start Date', type: 'string'}),
    defineField({name: 'endDate', title: 'End Date', type: 'string'}),
    defineField({
      name: 'artist',
      title: 'Artists (snapshot)',
      type: 'string',
      description: 'Automatically captured list of artists from the GraphQL catalogue',
    }),
    defineField({
      name: 'eventType',
      title: 'Event Type',
      type: 'string',
    }),
    defineField({
      name: 'exhibitionType',
      title: 'Exhibition Type',
      type: 'string',
      description: 'Comma separated snapshot of the exhibition types reported by GraphQL',
    }),
    defineField({
      name: 'exhibition_img_url',
      title: 'Exhibition Image URL',
      type: 'url',
      description: 'Image URL from GraphQL API',
    }),
    defineField({name: 'description', title: 'Description', type: 'text'}),
    defineField({
      name: 'gallery',
      title: 'Gallery Info',
      type: 'object',
      fields: [
        defineField({name: 'id', type: 'string', title: 'Gallery ID'}),
        defineField({name: 'name', type: 'string', title: 'Gallery Name'}),
        defineField({name: 'city', type: 'string', title: 'City'}),
        defineField({name: 'address', type: 'string', title: 'Address'}),
        defineField({name: 'website', type: 'url', title: 'Website'}),
        workingHoursField({
          name: 'openingHours',
          title: 'Opening Hours',
          description: 'One entry per line (e.g. "Mon-Fri 10:00-18:00", "Sun Closed")',
        }),
        defineField({name: 'allowed', type: 'string', title: 'Admission Policy'}),
        defineField({name: 'specialEvent', type: 'string', title: 'Special Event Flag'}),
        defineField({name: 'eventType', type: 'string', title: 'Gallery Event Type'}),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      galleryName: 'gallery.name',
    },
    prepare({title, galleryName}) {
      return {
        title: title || 'GraphQL exhibition',
        subtitle: galleryName || 'External reference',
      }
    },
  },
})
