import {HomeIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'
import GraphqlExhibitionInput from './review/GraphqlExhibitionInput'

export const homepageContent = defineType({
  name: 'homepageContent',
  title: 'Homepage Content',
  type: 'document',
  icon: HomeIcon,
  groups: [
    {name: 'hero', title: 'Hero & Stories', icon: HomeIcon, default: true},
    {name: 'features', title: 'Curated Content', icon: HomeIcon},
    {name: 'engagement', title: 'Engagement Modules', icon: HomeIcon},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Homepage',
      readOnly: true,
      group: 'hero',
    }),
    defineField({
      name: 'heroSection',
      title: 'Hero Section',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({
          name: 'featuredReview',
          type: 'reference',
          to: [{type: 'review'}],
          title: 'Featured Review',
          validation: (Rule) => [Rule.required().error('Featured review is required for the hero')],
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
      group: 'hero',
      of: [defineArrayMember({type: 'reference', to: [{type: 'review'}]})],
      validation: (Rule) => [Rule.max(6).warning('Homepage supports up to 6 curated reviews')],
    }),
    defineField({
      name: 'featuredArtistStory',
      title: 'Featured Artist Story',
      type: 'reference',
      group: 'hero',
      to: [{type: 'artistStory'}],
    }),
    defineField({
      name: 'spotlightExhibitions',
      title: 'Spotlight Exhibitions',
      description: 'Curated GraphQL exhibitions to highlight on the homepage',
      type: 'array',
      group: 'features',
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
      group: 'features',
      to: [{type: 'guide'}],
    }),
    defineField({
      name: 'tickerMarquee',
      title: 'Header Ticker',
      type: 'object',
      description: 'Controls the scrolling marquee that appears at the top of every page',
      group: 'engagement',
      fields: [
        defineField({
          name: 'messages',
          title: 'Ticker Messages',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({
                  name: 'message',
                  title: 'Message',
                  type: 'string',
                  validation: (Rule) => [
                    Rule.required().error('Ticker messages must include text'),
                    Rule.max(120).warning('Keep ticker messages short for readability'),
                  ],
                }),
                defineField({
                  name: 'status',
                  title: 'Status',
                  type: 'string',
                  options: {
                    list: [
                      {title: 'Active', value: 'active'},
                      {title: 'Paused', value: 'paused'},
                    ],
                    layout: 'radio',
                  },
                  initialValue: 'active',
                }),
              ],
            }),
          ],
          validation: (Rule) => [
            Rule.min(1).warning('Add at least one ticker message to populate the marquee'),
            Rule.max(10).warning('Ticker works best with 10 or fewer messages'),
          ],
        }),
      ],
    }),
    defineField({
      name: 'aiChatbotTeaser',
      title: 'AI Chatbot Teaser',
      type: 'object',
      group: 'engagement',
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
      group: 'engagement',
      fields: [
        defineField({name: 'headline', type: 'string'}),
        defineField({name: 'description', type: 'text', rows: 2}),
        defineField({name: 'placeholder', type: 'string', title: 'Email Placeholder'}),
        defineField({name: 'submitText', type: 'string', title: 'Submit Button Text'}),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'heroSection.featuredReview.title',
      guide: 'weekendGuide.title',
      tickerCount: 'tickerMarquee.messages',
    },
    prepare({title, guide, tickerCount}) {
      const tickerLength = Array.isArray(tickerCount) ? tickerCount.length : 0
      const subtitleParts = [guide ? `Weekend Guide: ${guide}` : null, tickerLength ? `${tickerLength} ticker messages` : null]
        .filter(Boolean)
      return {
        title: title || 'Homepage layout',
        subtitle: subtitleParts.join(' • ') || 'Update hero and engagement blocks',
        media: HomeIcon,
      }
    },
  },
})
