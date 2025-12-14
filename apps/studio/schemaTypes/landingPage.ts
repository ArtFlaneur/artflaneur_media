
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
      validation: (Rule) => [Rule.required().error('Title is required to publish a landing page')],
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => [Rule.required().error('Slug is required to generate a URL')],
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
        defineField({name: 'headline', type: 'string'}),
        defineField({name: 'subheadline', type: 'text', rows: 2}),
        defineField({name: 'heroImage', type: 'image', options: {hotspot: true}}),
        defineField({name: 'ctaText', type: 'string'}),
        defineField({name: 'ctaUrl', type: 'string'}),
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
            defineField({name: 'title', type: 'string'}),
            defineField({name: 'description', type: 'text', rows: 3}),
            defineField({name: 'icon', type: 'image', options: {hotspot: true}}),
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
            defineField({name: 'name', type: 'string', title: 'Package Name'}),
            defineField({name: 'price', type: 'string'}),
            {
              name: 'features',
              type: 'array',
              title: 'Features',
              of: [defineArrayMember({type: 'string'})],
            },
            defineField({name: 'ctaText', type: 'string'}),
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
            defineField({name: 'quote', type: 'text', rows: 3}),
            defineField({name: 'author', type: 'string'}),
            defineField({name: 'role', type: 'string'}),
            defineField({name: 'photo', type: 'image', options: {hotspot: true}}),
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
            defineField({name: 'question', type: 'string'}),
            defineField({name: 'answer', type: 'text', rows: 3}),
          ],
        }),
      ],
    }),
    defineField({
      name: 'contactForm',
      title: 'Contact Form',
      type: 'object',
      fields: [
        defineField({name: 'headline', type: 'string'}),
        defineField({name: 'description', type: 'text', rows: 2}),
        defineField({name: 'submitText', type: 'string', title: 'Submit Button Text'}),
      ],
    }),
    defineField({
      name: 'trialCta',
      title: 'Trial CTA',
      type: 'object',
      fields: [
        defineField({name: 'text', type: 'string', title: 'CTA Text'}),
        defineField({name: 'url', type: 'string'}),
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