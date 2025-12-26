import {CalendarIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

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
      name: 'gallery',
      title: 'Gallery Info',
      type: 'object',
      fields: [
        defineField({name: 'id', type: 'string', title: 'Gallery ID'}),
        defineField({name: 'name', type: 'string', title: 'Gallery Name'}),
        defineField({name: 'city', type: 'string', title: 'City'}),
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
