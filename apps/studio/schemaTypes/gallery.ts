import {PinIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const gallery = defineType({
  name: 'gallery',
  title: 'Gallery',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({
      name: 'directusId',
      title: 'Directus ID',
      type: 'string',
      description: 'Gallery ID from Directus',
      readOnly: true,
    }),
    defineField({
      name: 'name',
      title: 'Gallery Name',
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
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
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
        {name: 'phone', type: 'string', title: 'Phone'},
        {name: 'email', type: 'string', title: 'Email'},
      ],
    }),
    defineField({
      name: 'social',
      title: 'Socials',
      type: 'object',
      description: 'Social media links',
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