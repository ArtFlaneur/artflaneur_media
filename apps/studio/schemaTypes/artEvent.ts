
import {defineArrayMember, defineField, defineType} from 'sanity'

export const artEvent = defineType({
  name: 'artEvent',
  title: 'Art Event',
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
      name: 'eventDate',
      title: 'Event Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'object',
      fields: [
        {name: 'gallery', type: 'reference', to: [{type: 'gallery'}], title: 'Gallery'},
        {name: 'customLocation', type: 'string', title: 'Custom Location'},
        {name: 'address', type: 'string', title: 'Address'},
        {name: 'geopoint', type: 'geopoint', title: 'Coordinates'},
      ],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
    }),
    defineField({
      name: 'image',
      title: 'Event Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {name: 'alt', type: 'string', title: 'Alt text'},
      ],
    }),
    defineField({
      name: 'artists',
      title: 'Artists',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'artist'}]})],
    }),
    defineField({
      name: 'ticketPrice',
      title: 'Ticket Price',
      type: 'string',
    }),
    defineField({
      name: 'bookingUrl',
      title: 'Booking URL',
      type: 'url',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      date: 'eventDate',
      media: 'image',
    },
    prepare(selection) {
      const {title, date, media} = selection
      const eventDate = date ? new Date(date).toLocaleDateString('ru-RU') : ''
      return {
        title: title,
        subtitle: eventDate,
        media: media,
      }
    },
  },
})