import {HomeIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'
import GraphqlExhibitionInput from './review/GraphqlExhibitionInput'
import GraphqlGalleryInput from './guide/GraphqlGalleryInput'

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
          to: [{type: 'review'}, {type: 'article'}],
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
      of: [defineArrayMember({type: 'reference', to: [{type: 'review'}, {type: 'article'}]})],
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
      name: 'featuredGalleries',
      title: 'Gallery Partners',
      description: 'Paid placements for partner galleries with their current programming',
      type: 'array',
      group: 'features',
      of: [
        defineArrayMember({
          name: 'featuredGallery',
          title: 'Featured Gallery',
          type: 'object',
          fields: [
            defineField({
              name: 'gallery',
              title: 'Gallery',
              type: 'externalGalleryReference',
              components: {input: GraphqlGalleryInput},
              validation: (Rule) => [Rule.required().error('Select a gallery to spotlight')],
            }),
            defineField({
              name: 'sponsor',
              title: 'Sponsor',
              type: 'reference',
              to: [{type: 'sponsor'}],
              description: 'Optional sponsor entity powering this placement',
            }),
            defineField({
              name: 'highlightedExhibitions',
              title: 'Highlighted Exhibitions',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'externalExhibitionReference',
                  components: {input: GraphqlExhibitionInput},
                }),
              ],
              validation: (Rule) => [
                Rule.min(1).error('Add at least one exhibition for this partner'),
                Rule.max(3).warning('Limit to three exhibitions per gallery partner'),
              ],
            }),
            defineField({
              name: 'featureCopy',
              title: 'Feature Copy',
              type: 'text',
              rows: 3,
              description: 'Commercial blurb that explains the partnership value',
              validation: (Rule) => [Rule.required().error('Feature copy is required for sponsored placements')],
            }),
            defineField({
              name: 'ctaText',
              title: 'CTA Label',
              type: 'string',
              initialValue: 'Visit exhibition',
            }),
            defineField({
              name: 'ctaUrl',
              title: 'CTA URL',
              type: 'url',
              description: 'Link to booking page, microsite, or gallery landing page',
            }),
          ],
          preview: {
            select: {
              title: 'gallery.name',
              subtitle: 'gallery.city',
            },
            prepare({title, subtitle}) {
              return {
                title: title || 'Featured gallery',
                subtitle: subtitle || 'Paid placement',
              }
            },
          },
        }),
      ],
      validation: (Rule) => [Rule.max(6).warning('Highlight up to six partner galleries at a time')],
    }),
    defineField({
      name: 'cityPicks',
      title: "Editor's Picks by City",
      description: 'Localized modules that can be paired with regional sponsors',
      type: 'array',
      group: 'features',
      of: [
        defineArrayMember({
          name: 'cityPick',
          title: 'City Picks',
          type: 'object',
          fields: [
            defineField({
              name: 'city',
              title: 'City',
              type: 'string',
              validation: (Rule) => [Rule.required().error('City label is required')],
            }),
            defineField({
              name: 'tagline',
              title: 'Tagline',
              type: 'string',
              description: 'Short line that sells the scene in this city',
            }),
            defineField({
              name: 'heroImage',
              title: 'Hero Image',
              type: 'image',
              options: {hotspot: true},
              fields: [
                defineField({
                  name: 'alt',
                  type: 'string',
                  validation: (Rule) => [Rule.required().error('Alt text is required for city hero images')],
                }),
              ],
              validation: (Rule) => [Rule.required().error('Provide a hero image for each city module')],
            }),
            defineField({
              name: 'sponsor',
              title: 'Local Sponsor',
              type: 'reference',
              to: [{type: 'sponsor'}],
            }),
            defineField({
              name: 'picks',
              title: 'Featured Pieces',
              type: 'array',
              of: [defineArrayMember({type: 'reference', to: [{type: 'review'}, {type: 'guide'}]})],
              validation: (Rule) => [
                Rule.required().error('Add at least one pick for this city'),
                Rule.max(3).warning('Limit each city digest to three picks'),
              ],
            }),
            defineField({
              name: 'ctaText',
              title: 'CTA Label',
              type: 'string',
              initialValue: 'Open city digest',
            }),
            defineField({
              name: 'ctaUrl',
              title: 'CTA URL',
              type: 'url',
              description: 'Optional override link (defaults to the first pick)',
            }),
          ],
          preview: {
            select: {
              title: 'city',
              subtitle: 'tagline',
            },
            prepare({title, subtitle}) {
              return {
                title: title || 'City digest',
                subtitle: subtitle || 'Localized picks',
              }
            },
          },
        }),
      ],
      validation: (Rule) => [Rule.max(5).warning('Rotate up to five city spotlights per week')],
    }),
    defineField({
      name: 'weekendGuide',
      title: 'Weekend Guide Highlight',
      type: 'reference',
      group: 'features',
      to: [{type: 'guide'}],
    }),
    defineField({
      name: 'comingSoon',
      title: 'Coming Soon Events',
      description: 'Upcoming launches or previews that drive urgency and early access',
      type: 'array',
      group: 'features',
      of: [
        defineArrayMember({
          name: 'comingSoonEvent',
          title: 'Coming Soon Event',
          type: 'object',
          fields: [
            defineField({
              name: 'exhibition',
              title: 'Exhibition',
              type: 'externalExhibitionReference',
              components: {input: GraphqlExhibitionInput},
              validation: (Rule) => [Rule.required().error('Select an exhibition to tease')],
            }),
            defineField({
              name: 'urgencyLabel',
              title: 'Urgency Label',
              type: 'string',
              initialValue: 'Coming soon',
            }),
            defineField({
              name: 'sponsor',
              title: 'Sponsor',
              type: 'reference',
              to: [{type: 'sponsor'}],
              description: 'Partner who gets early access billing',
            }),
            defineField({
              name: 'ctaText',
              title: 'CTA Label',
              type: 'string',
              initialValue: 'Get notified',
            }),
            defineField({
              name: 'ctaUrl',
              title: 'CTA URL',
              type: 'url',
            }),
          ],
          preview: {
            select: {
              title: 'exhibition.title',
              subtitle: 'urgencyLabel',
            },
            prepare({title, subtitle}) {
              return {
                title: title || 'Upcoming exhibition',
                subtitle: subtitle || 'Coming soon',
              }
            },
          },
        }),
      ],
      validation: (Rule) => [Rule.max(4).warning('Showcase up to four upcoming events')],
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
    defineField({
      name: 'displayAds',
      title: 'Display Banner Slots',
      description: 'Standard banner inventory for sponsors and house campaigns',
      type: 'array',
      group: 'engagement',
      of: [
        defineArrayMember({
          name: 'displayAd',
          title: 'Display Ad',
          type: 'object',
          fields: [
            defineField({
              name: 'placement',
              title: 'Placement',
              type: 'string',
              options: {
                list: [
                  {title: 'After Hero', value: 'afterHero'},
                  {title: 'Mid Page', value: 'midPage'},
                  {title: 'Pre-Footer', value: 'preFooter'},
                ],
                layout: 'radio',
              },
              validation: (Rule) => [Rule.required().error('Select where this banner should render')],
            }),
            defineField({name: 'label', title: 'Label', type: 'string'}),
            defineField({
              name: 'headline',
              title: 'Headline',
              type: 'string',
              validation: (Rule) => [Rule.required().error('Banner headline is required')],
            }),
            defineField({
              name: 'body',
              title: 'Body Copy',
              type: 'text',
              rows: 2,
              validation: (Rule) => [Rule.required().error('Add supporting copy for the banner')],
            }),
            defineField({
              name: 'image',
              title: 'Creative',
              type: 'image',
              options: {hotspot: true},
              fields: [
                defineField({
                  name: 'alt',
                  type: 'string',
                  validation: (Rule) => [Rule.required().error('Alt text is required for ad creatives')],
                }),
              ],
              validation: (Rule) => [Rule.required().error('Upload creative artwork for the banner')],
            }),
            defineField({name: 'ctaText', title: 'CTA Label', type: 'string', initialValue: 'Learn more'}),
            defineField({name: 'ctaUrl', title: 'CTA URL', type: 'url'}),
            defineField({
              name: 'backgroundColor',
              title: 'Background Color',
              type: 'string',
              description: 'Optional hex or CSS color token for the banner background',
            }),
          ],
          preview: {
            select: {
              title: 'headline',
              subtitle: 'placement',
            },
            prepare({title, subtitle}) {
              return {
                title: title || 'Display ad',
                subtitle: subtitle || 'Unplaced',
              }
            },
          },
        }),
      ],
      validation: (Rule) => [Rule.max(2).warning('Only sell two banner slots per page view')],
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
