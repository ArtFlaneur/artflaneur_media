
import {defineArrayMember, defineField, defineType} from 'sanity'

export const landingPage = defineType({
  name: 'landingPage',
  title: 'Landing Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
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
      name: 'pageType',
      title: 'Page Type',
      type: 'string',
      options: {
        list: [
          {title: 'For Galleries', value: 'forGalleries'},
          {title: 'For Events', value: 'forEvents'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'heroSection',
      title: 'Hero Section',
      type: 'object',
      fields: [
        {name: 'headline', type: 'string', title: 'Headline'},
        {name: 'subheadline', type: 'text', title: 'Subheadline', rows: 2},
        {name: 'heroImage', type: 'image', title: 'Hero Image', options: {hotspot: true}},
        {name: 'ctaText', type: 'string', title: 'CTA Text'},
        {name: 'ctaUrl', type: 'string', title: 'CTA URL'},
      ],
    }),
    defineField({
      name: 'problemCards',
      title: 'Problem Cards',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            {name: 'title', type: 'string', title: 'Title'},
            {name: 'description', type: 'text', title: 'Description', rows: 3},
            {name: 'icon', type: 'image', title: 'Icon', options: {hotspot: true}},
          ],
        }),
      ],
    }),
    defineField({
      name: 'packages',
      title: 'Packages',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            {name: 'name', type: 'string', title: 'Package Name'},
            {name: 'price', type: 'string', title: 'Price'},
            {
              name: 'features',
              type: 'array',
              title: 'Features',
              of: [defineArrayMember({type: 'string'})],
            },
            {name: 'ctaText', type: 'string', title: 'CTA Text'},
          ],
        }),
      ],
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            {name: 'quote', type: 'text', title: 'Quote', rows: 3},
            {name: 'author', type: 'string', title: 'Author'},
            {name: 'role', type: 'string', title: 'Role'},
            {name: 'photo', type: 'image', title: 'Photo', options: {hotspot: true}},
          ],
        }),
      ],
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            {name: 'question', type: 'string', title: 'Question'},
            {name: 'answer', type: 'text', title: 'Answer', rows: 3},
          ],
        }),
      ],
    }),
    defineField({
      name: 'contactForm',
      title: 'Contact Form',
      type: 'object',
      fields: [
        {name: 'headline', type: 'string', title: 'Headline'},
        {name: 'description', type: 'text', title: 'Description', rows: 2},
        {name: 'submitText', type: 'string', title: 'Submit Button Text'},
      ],
    }),
    defineField({
      name: 'trialCta',
      title: 'Trial CTA',
      type: 'object',
      fields: [
        {name: 'text', type: 'string', title: 'CTA Text'},
        {name: 'url', type: 'string', title: 'CTA URL'},
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      pageType: 'pageType',
    },
    prepare(selection) {
      const {title, pageType} = selection
      return {
        title: title,
        subtitle: pageType || 'Landing Page',
      }
    },
  },
})