import {PresentationIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const landingPage = defineType({
  name: 'landingPage',
  title: 'Landing Page',
  type: 'document',
  icon: PresentationIcon,
  groups: [
    {name: 'hero', title: 'Hero', icon: PresentationIcon, default: true},
    {name: 'content', title: 'Content Blocks', icon: PresentationIcon},
    {name: 'conversion', title: 'Conversion', icon: PresentationIcon},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'hero',
      validation: (Rule) => [Rule.required().error('Title is required to publish a landing page'), Rule.max(80).warning('Keep titles short for hero layouts')],
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      group: 'hero',
      validation: (Rule) => [Rule.required().error('Slug is required to generate a URL')],
    }),
    defineField({
      name: 'pageType',
      title: 'Page Type',
      type: 'string',
      group: 'hero',
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
      group: 'hero',
      fields: [
        defineField({
          name: 'headline',
          type: 'string',
          validation: (Rule) => [Rule.required().error('Headline is required for the hero section')],
        }),
        defineField({name: 'subheadline', type: 'text', rows: 2}),
        defineField({name: 'heroImage', type: 'image', options: {hotspot: true}}),
        defineField({name: 'ctaText', type: 'string', title: 'Primary CTA Label'}),
        defineField({name: 'ctaUrl', type: 'url', title: 'Primary CTA URL'}),
      ],
    }),
    defineField({
      name: 'problemCards',
      title: 'Problem Cards',
      type: 'array',
      group: 'content',
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
      validation: (Rule) => [Rule.max(4).warning('Keep hero problem statements focused (max 4)')],
    }),
    defineField({
      name: 'packages',
      title: 'Packages',
      type: 'array',
      group: 'content',
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
      group: 'content',
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
      group: 'content',
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
      group: 'conversion',
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
      group: 'conversion',
      fields: [
        defineField({name: 'text', type: 'string', title: 'CTA Text'}),
        defineField({name: 'url', type: 'url'}),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      pageType: 'pageType',
      hero: 'heroSection.headline',
    },
    prepare(selection) {
      const {title, pageType, hero} = selection
      const typeLabel = pageType === 'forGalleries' ? 'Galleries' : pageType === 'forEvents' ? 'Events' : 'Generic'
      return {
        title: title,
        subtitle: hero ? `${typeLabel} • ${hero}` : typeLabel,
        media: PresentationIcon,
      }
    },
  },
})