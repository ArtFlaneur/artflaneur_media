
import {defineArrayMember, defineField, defineType} from 'sanity'

export const homepageContent = defineType({
  name: 'homepageContent',
  title: 'Homepage Content',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Homepage',
      readOnly: true,
    }),
    defineField({
      name: 'heroSection',
      title: 'Hero Section',
      type: 'object',
      fields: [
        defineField({
          name: 'featuredReview',
          type: 'reference',
          to: [{type: 'review'}],
          title: 'Featured Review',
        }),
        defineField({
          name: 'weeklyStory',
          type: 'reference',
          to: [{type: 'artistStory'}],
          title: 'Weekly Artist Story',
        }),
      ],
    }),
    defineField({
      name: 'latestReviews',
      title: 'Latest Reviews',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'review'}]})],
      validation: (Rule) => [Rule.max(6).warning('Homepage supports up to 6 curated reviews')],
    }),
    defineField({
      name: 'featuredArtistStory',
      title: 'Featured Artist Story',
      type: 'reference',
      to: [{type: 'artistStory'}],
    }),
    defineField({
      name: 'weekendGuide',
      title: 'Weekend Guide Highlight',
      type: 'reference',
      to: [{type: 'guide'}],
    }),
    defineField({
      name: 'aiChatbotTeaser',
      title: 'AI Chatbot Teaser',
      type: 'object',
      fields: [
        defineField({name: 'headline', type: 'string'}),
        defineField({name: 'description', type: 'text', rows: 2}),
        defineField({name: 'ctaText', type: 'string', title: 'CTA Text'}),
      ],
    }),
    defineField({
      name: 'newsletterSignup',
      title: 'Newsletter Signup',
      type: 'object',
      fields: [
        defineField({name: 'headline', type: 'string'}),
        defineField({name: 'description', type: 'text', rows: 2}),
        defineField({name: 'placeholder', type: 'string', title: 'Email Placeholder'}),
        defineField({name: 'submitText', type: 'string', title: 'Submit Button Text'}),
      ],
    }),
  ],
})