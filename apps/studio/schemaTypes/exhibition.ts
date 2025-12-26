import {defineArrayMember, defineField, defineType} from 'sanity'
import {CalendarIcon} from '@sanity/icons'

export const exhibition = defineType({
  name: 'exhibition',
  type: 'document',
  icon: CalendarIcon,
  fields: [
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
    defineField({
      name: 'supabaseId',
      title: 'Supabase Submission ID',
      type: 'string',
      description: 'Links this exhibition to the gallery dashboard submission that created it',
      readOnly: true,
      validation: (Rule) => [
        Rule.regex(/^[A-Za-z0-9-]+$/).warning('Supabase IDs should only use letters, numbers, and dashes'),
      ],
    }),
    defineField({
      name: 'graphqlId',
      title: 'GraphQL Catalogue ID',
      type: 'string',
      description: 'Optional ID for referencing this exhibition inside the AppSync catalogue',
      readOnly: true,
      validation: (Rule) => [
        Rule.regex(/^[A-Za-z0-9_-]+$/).warning('GraphQL IDs should stay URL-safe'),
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