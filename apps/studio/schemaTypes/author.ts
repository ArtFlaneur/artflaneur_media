import {defineArrayMember, defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons'
import {appCtaField, schemaMarkupField, seoField, slugField, summaryField} from './fields/commonFields'

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
      description: 'One-liner that describes this ambassador’s POV',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'body',
      title: 'Full Profile',
      type: 'blockContent',
      description: 'Structured long-form story for AI-ready ambassador pages',
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
      name: 'specialization',
      title: 'Specialization',
      type: 'string',
      description: 'Primary beat, discipline, or geographic focus',
    }),
    defineField({
      name: 'currentInterests',
      title: 'Current Interests',
      type: 'text',
      rows: 3,
      description: 'What this ambassador is researching or covering right now',
    }),
    defineField({
      name: 'recommendations',
      title: 'Recommendations',
      type: 'array',
      description: 'Link galleries, exhibitions, or guides they recommend',
      of: [
        defineArrayMember({name: 'galleryRecommendation', type: 'reference', to: [{type: 'gallery'}]}),
        defineArrayMember({name: 'exhibitionRecommendation', type: 'reference', to: [{type: 'exhibition'}]}),
        defineArrayMember({name: 'guideRecommendation', type: 'reference', to: [{type: 'guide'}]}),
      ],
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
    appCtaField(),
    seoField(),
    schemaMarkupField(),
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