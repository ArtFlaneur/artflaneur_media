import {CalendarIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const artEvent = defineType({
  name: 'artEvent',
  title: 'Art Event',
  type: 'document',
  icon: CalendarIcon,
  groups: [
    {name: 'details', title: 'Event Details', default: true, icon: CalendarIcon},
    {name: 'location', title: 'Location'},
    {name: 'links', title: 'Links & Contacts'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Event Name',
      type: 'string',
      group: 'details',
      validation: (Rule) => [Rule.required().error('Event name is required')],
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'details',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => [Rule.required().error('Slug is required for URL generation')],
    }),
    defineField({
      name: 'type',
      title: 'Event Type',
      type: 'string',
      group: 'details',
      options: {
        list: [
          {title: 'Art Fair', value: 'Art Fair'},
          {title: 'Biennale', value: 'Biennale'},
          {title: 'Triennale', value: 'Triennale'},
          {title: 'Annual Festival', value: 'Annual Festival'},
          {title: 'Art Weekend', value: 'Art Weekend'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => [Rule.required().error('Event type is required')],
    }),
    defineField({
      name: 'discipline',
      title: 'Discipline',
      type: 'string',
      group: 'details',
      description: 'e.g., Contemporary Art, Sculpture, Interdisciplinary',
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
      group: 'details',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
      validation: (Rule) => [Rule.required().error('Start date is required')],
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'date',
      group: 'details',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
      validation: (Rule) => [
        Rule.required().error('End date is required'),
        Rule.custom((endDate, context) => {
          const startDate = (context.document as any)?.startDate
          if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            return 'End date must be after start date'
          }
          return true
        }),
      ],
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      group: 'location',
      validation: (Rule) => [Rule.required().error('City is required')],
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      group: 'location',
      validation: (Rule) => [Rule.required().error('Country is required')],
    }),
    defineField({
      name: 'region',
      title: 'Region',
      type: 'string',
      group: 'location',
      options: {
        list: [
          {title: 'Africa', value: 'Africa'},
          {title: 'Americas', value: 'Americas'},
          {title: 'Asia', value: 'Asia'},
          {title: 'Europe', value: 'Europe'},
          {title: 'Middle East', value: 'Middle East'},
          {title: 'Oceania', value: 'Oceania'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => [Rule.required().error('Region is required')],
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
      group: 'links',
      validation: (Rule) => [
        Rule.uri({
          scheme: ['http', 'https'],
        }),
      ],
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram',
      type: 'string',
      group: 'links',
      description: 'Instagram handle (e.g., @artbasel) or URL',
    }),
    defineField({
      name: 'email',
      title: 'Contact Email',
      type: 'string',
      group: 'links',
      validation: (Rule) => [
        Rule.custom((email) => {
          if (!email) return true
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          return emailRegex.test(email) ? true : 'Please enter a valid email address'
        }),
      ],
    }),
    defineField({
      name: 'organizer',
      title: 'Organizer',
      type: 'string',
      group: 'details',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      type: 'type',
      city: 'city',
      country: 'country',
      startDate: 'startDate',
      endDate: 'endDate',
    },
    prepare({title, type, city, country, startDate, endDate}) {
      const dateRange =
        startDate && endDate
          ? `${new Date(startDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} - ${new Date(endDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}`
          : ''
      const location = [city, country].filter(Boolean).join(', ')

      return {
        title: title || 'Untitled Event',
        subtitle: `${type || 'Event'} • ${location} • ${dateRange}`,
        media: CalendarIcon,
      }
    },
  },
  orderings: [
    {
      title: 'Start Date, Newest',
      name: 'startDateDesc',
      by: [{field: 'startDate', direction: 'desc'}],
    },
    {
      title: 'Start Date, Oldest',
      name: 'startDateAsc',
      by: [{field: 'startDate', direction: 'asc'}],
    },
    {
      title: 'Event Name, A-Z',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}],
    },
  ],
})
