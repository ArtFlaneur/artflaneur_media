import {UserIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {appCtaField, schemaMarkupField, seoField, slugField, summaryField} from './fields/commonFields'

export const artist = defineType({
  name: 'artist',
  title: 'Artist',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'directusId',
      title: 'Directus ID',
      type: 'string',
      description: 'Artist ID from Directus',
      readOnly: true,
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => [Rule.required().error('Name is required to publish an artist profile')],
    }),
    slugField({
      options: {
        source: 'name',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    summaryField({
      description: 'Short positioning statement for previews and AI snippets',
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'body',
      title: 'Full Profile',
      type: 'blockContent',
      description: 'Long-form story with Portable Text, fact tables, and key insights',
    }),
    defineField({
      name: 'birthYear',
      title: 'Birth Year',
      type: 'number',
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
    }),
    defineField({
      name: 'basedIn',
      title: 'Currently Based In',
      type: 'string',
      description: 'City or region where the artist primarily works now',
    }),
    defineField({
      name: 'practiceFocus',
      title: 'Practice Focus',
      type: 'string',
      description: 'Short description of mediums, movements, or topics',
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
    }),
    defineField({
      name: 'keyWorks',
      title: 'Key Works',
      type: 'array',
      description: 'Flag up to five representative works for AI call-outs',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'keyWork',
          title: 'Key Work',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => [Rule.required().error('Work title is required')],
            }),
            defineField({name: 'year', title: 'Year', type: 'string'}),
            defineField({
              name: 'exhibition',
              title: 'Exhibited At',
              type: 'reference',
              to: [{type: 'exhibition'}],
            }),
            defineField({name: 'concept', title: 'Concept / Notes', type: 'text', rows: 3}),
          ],
        }),
      ],
      validation: (Rule) => [Rule.max(5).warning('Select the most relevant works (max 5)')],
    }),
    defineField({
      name: 'exhibitions',
      title: 'Featured Exhibitions',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'exhibition'}]})],
      description: 'Link to current or notable shows',
    }),
    defineField({
      name: 'collections',
      title: 'Collections',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'collectionEntry',
          title: 'Collection',
          fields: [
            defineField({
              name: 'institution',
              title: 'Institution',
              type: 'string',
              validation: (Rule) => [Rule.required().error('Institution is required')],
            }),
            defineField({name: 'location', title: 'Location', type: 'string'}),
          ],
        }),
      ],
      validation: (Rule) => [Rule.max(10).warning('List the most recognizable collections (max 10)')],
    }),
    defineField({
      name: 'social',
      title: 'Socials',
      type: 'object',
      fields: [
        {name: 'instagram', type: 'url', title: 'Instagram'},
        {name: 'facebook', type: 'url', title: 'Facebook'},
        {name: 'twitter', type: 'url', title: 'Twitter/X'},
      ],
    }),
    defineField({
      name: 'syncedAt',
      title: 'Last Synced At',
      type: 'datetime',
      description: 'Timestamp of the most recent Directus sync',
      readOnly: true,
    }),
    appCtaField(),
    seoField(),
    schemaMarkupField(),
  ],
  preview: {
    select: {
      title: 'name',
      country: 'country',
      media: 'photo',
    },
    prepare(selection) {
      const {title, country, media} = selection
      return {
        title: title,
        subtitle: country || 'No country specified',
        media: media,
      }
    },
  },
})