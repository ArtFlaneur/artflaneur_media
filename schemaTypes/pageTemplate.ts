import {defineField, defineType} from 'sanity'

export const pageTemplate = defineType({
  name: 'pageTemplate',
  title: 'Page Template',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Template Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'templateType',
      title: 'Template Type',
      type: 'string',
      options: {
        list: [
          {title: 'Review', value: 'review'},
          {title: 'Artist Story', value: 'artistStory'},
          {title: 'Guide', value: 'guide'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'templateType',
    },
  },
})