import {defineType, defineField} from 'sanity'
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
      validation: (Rule) => Rule.required().error('Title is required'),
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
      name: 'gallery',
      title: 'Gallery',
      type: 'reference',
      to: [{type: 'gallery'}],
      validation: (Rule) => Rule.required(),
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
        {
          name: 'alt',
          type: 'string',
          title: 'Alt text',
        },
      ],
    }),
    defineField({
      name: 'artists',
      title: 'Artists',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'artist'}]}],
    }),
    defineField({
      name: 'curators',
      title: 'Curators',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'curator'}]}],
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
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