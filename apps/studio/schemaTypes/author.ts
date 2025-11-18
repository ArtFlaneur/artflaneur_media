import {defineType, defineField} from 'sanity'
import {UserIcon} from '@sanity/icons'

export const author = defineType({
  name: 'author',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().error('Name is required'),
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
      title: 'Bio',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          {title: 'Author', value: 'author'},
          {title: 'Editor', value: 'editor'},
          {title: 'Chief Editor', value: 'chiefEditor'},
        ],
        layout: 'radio',
      },
      initialValue: 'author',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'social',
      title: 'Socials',
      type: 'object',
      fields: [
        {name: 'instagram', type: 'url', title: 'Instagram'},
        {name: 'twitter', type: 'url', title: 'Twitter/X'},
        {name: 'website', type: 'url', title: 'Личный сайт'},
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      role: 'role',
      media: 'photo',
    },
    prepare(selection) {
      const {title, role, media} = selection
      const roleLabels: Record<string, string> = {
        author: '✍️ Author',
        editor: '📝 Editor',
        chiefEditor: '👑 Chief Editor',
      }
      return {
        title: title,
        subtitle: roleLabels[role] || role,
        media: media,
      }
    },
  },
})