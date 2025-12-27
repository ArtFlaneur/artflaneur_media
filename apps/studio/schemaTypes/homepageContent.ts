
import {defineArrayMember, defineField, defineType} from 'sanity'
import GraphqlExhibitionInput from './review/GraphqlExhibitionInput'

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
      name: 'spotlightExhibitions',
      title: 'Spotlight Exhibitions',
      description: 'Curated GraphQL exhibitions to highlight on the homepage',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'spotlightExhibition',
          title: 'Spotlight Exhibition',
          type: 'object',
          fields: [
            defineField({
              name: 'exhibition',
              title: 'GraphQL Exhibition',
              type: 'externalExhibitionReference',
              components: {input: GraphqlExhibitionInput},
              validation: (Rule) => [Rule.required().error('Select an exhibition from GraphQL')],
            }),
            defineField({
              name: 'badge',
              title: 'Badge Label',
              type: 'string',
              description: 'Short tag such as “Must see” or “Closing soon”',
              validation: (Rule) => [Rule.max(24).warning('Badges work best under 24 characters')],
            }),
            defineField({
              name: 'featureCopy',
              title: 'Supporting Copy',
              type: 'text',
              rows: 3,
              description: 'Optional blurb that appears alongside the exhibition card',
              validation: (Rule) => [Rule.max(280).warning('Keep copy short for the homepage layout')],
            }),
            defineField({
              name: 'ctaText',
              title: 'CTA Label',
              type: 'string',
              initialValue: 'View gallery',
            }),
          ],
          preview: {
            select: {
              title: 'exhibition.title',
              subtitle: 'badge',
            },
            prepare({title, subtitle}) {
              return {
                title: title || 'GraphQL exhibition',
                subtitle: subtitle || 'Homepage spotlight',
              }
            },
          },
        }),
      ],
      validation: (Rule) => [Rule.max(6).warning('Homepage supports up to six spotlight exhibitions')],
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