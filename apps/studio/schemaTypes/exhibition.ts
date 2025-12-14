import {defineArrayMember, defineField, defineType} from 'sanity'
import {CalendarIcon} from '@sanity/icons'

export const exhibition = defineType({
  name: 'exhibition',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'directusId',
      title: 'Directus Exhibition ID',
      type: 'number',
      description: 'Exhibition ID from Directus',
      readOnly: true,
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => [Rule.required().error('Title is required')],
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
      name: 'gallery',
      title: 'Gallery',
      type: 'reference',
      to: [{type: 'gallery'}],
      validation: (Rule) => [Rule.required().error('Gallery is required to publish an exhibition')],
    }),
    defineField({
      name: 'directusGalleryId',
      title: 'Directus Gallery ID',
      type: 'number',
      description: 'Gallery ID from Directus for sync',
      readOnly: true,
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({name: 'alt', type: 'string', title: 'Alt text'}),
      ],
    }),
    defineField({
      name: 'artists',
      title: 'Artists',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'artist'}]})],
    }),
    defineField({
      name: 'curators',
      title: 'Curators',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'curator'}]})],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
      validation: (Rule) => [Rule.required().error('Start date is required')],
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
      validation: (Rule) => [Rule.required().error('End date is required')],
    }),
    defineField({
      name: 'ticketing',
      title: 'Ticketing',
      type: 'object',
      description: 'Control how ticket CTAs appear for this exhibition',
      fields: [
        defineField({
          name: 'access',
          title: 'Access Type',
          type: 'string',
          options: {
            list: [
              {title: 'Free entry', value: 'free'},
              {title: 'Paid / ticketed', value: 'ticketed'},
            ],
            layout: 'radio',
          },
          initialValue: 'free',
        }),
        defineField({
          name: 'ticketPrice',
          title: 'Ticket Price',
          type: 'string',
          description: 'Displayed on the CTA when access is ticketed',
        }),
        defineField({
          name: 'bookingUrl',
          title: 'Booking URL',
          type: 'url',
          description: 'Link to purchase tickets',
        }),
        defineField({
          name: 'ctaLabel',
          title: 'CTA Label',
          type: 'string',
          description: 'Optional override for the default “Buy tickets” label',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      gallery: 'gallery.name',
      media: 'image',
      startDate: 'startDate',
    },
    prepare(selection) {
      const {title, gallery, media, startDate} = selection
      const date = startDate ? new Date(startDate).toLocaleDateString('ru-RU') : ''
      return {
        title: title,
        subtitle: `${gallery || 'No gallery'} • ${date}`,
        media: media,
      }
    },
  },
})