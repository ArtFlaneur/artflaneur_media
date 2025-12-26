import {PinIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {appCtaField, schemaMarkupField, seoField, slugField, summaryField} from './fields/commonFields'

export const gallery = defineType({
  name: 'gallery',
  title: 'Gallery',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Gallery Name',
      type: 'string',
      validation: (Rule) => [Rule.required().error('Gallery name is required')],
    }),
    slugField({
      options: {
        source: 'name',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    summaryField({
      description: '1–2 sentence positioning statement for AI and cards',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (Rule) => [
        Rule.required().error('Description helps AI understand the gallery focus'),
      ],
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'string',
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
    }),
    defineField({
      name: 'geopoint',
      title: 'Coordinates',
      type: 'geopoint',
      description: 'Map coordinates for display',
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
    }),
    defineField({
      name: 'focus',
      title: 'Focus / Specialization',
      type: 'string',
      description: 'Primary mediums, eras, or curatorial lens',
    }),
    defineField({
      name: 'artists',
      title: 'Represented Artists',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'artist'}]})],
      description: 'Link any artists formally represented by the gallery',
    }),
    defineField({
      name: 'upcomingShows',
      title: 'Upcoming Shows',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'exhibition'}]})],
      description: 'Reference relevant future programming to power recommendations',
    }),
    defineField({
      name: 'workingHours',
      title: 'Working Hours',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'contact',
      title: 'Contacts',
      type: 'object',
      description: 'Additional contact information',
      fields: [
        defineField({name: 'phone', type: 'string', title: 'Phone'}),
        defineField({name: 'email', type: 'string', title: 'Email'}),
      ],
    }),
    defineField({
      name: 'social',
      title: 'Socials',
      type: 'object',
      description: 'Social media links',
      fields: [
        defineField({name: 'instagram', type: 'url', title: 'Instagram'}),
        defineField({name: 'facebook', type: 'url', title: 'Facebook'}),
        defineField({name: 'twitter', type: 'url', title: 'Twitter/X'}),
      ],
    }),
    defineField({
      name: 'exportTrends',
      title: 'Export Trends',
      type: 'object',
      description: 'Optional notes on markets, fairs, and regions',
      fields: [
        defineField({name: 'headline', title: 'Headline', type: 'string'}),
        defineField({name: 'details', title: 'Details', type: 'text', rows: 3}),
      ],
      options: {collapsible: true, collapsed: true},
    }),
    defineField({
      name: 'body',
      title: 'Editorial Overview',
      type: 'blockContent',
      description: 'Long-form story mixing Portable Text, fact tables, and key insights',
    }),
    defineField({
      name: 'supabaseId',
      title: 'Supabase Gallery ID',
      type: 'string',
      readOnly: true,
      description: 'Auto-filled when a gallery profile is synced from the dashboard',
      validation: (Rule) => [
        Rule.regex(/^[A-Za-z0-9-]+$/).warning('Supabase IDs typically look like UUIDs'),
      ],
    }),
    defineField({
      name: 'graphqlId',
      title: 'GraphQL Catalogue ID',
      type: 'string',
      readOnly: true,
      description: 'Identifier from the AWS AppSync dataset for references inside guides',
      validation: (Rule) => [
        Rule.regex(/^[A-Za-z0-9_-]+$/).warning('GraphQL IDs should remain URL-safe'),
      ],
    }),
    appCtaField(),
    seoField(),
    schemaMarkupField(),
  ],
  preview: {
    select: {
      title: 'name',
      city: 'city',
      media: 'image',
    },
    prepare(selection) {
      const {title, city, media} = selection
      return {
        title: title,
        subtitle: city || 'Without city',
        media: media,
      }
    },
  },
})