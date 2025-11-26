import {UserIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'text',
      rows: 4,
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
      name: 'website',
      title: 'Website',
      type: 'url',
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