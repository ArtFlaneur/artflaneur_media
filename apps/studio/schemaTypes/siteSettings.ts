import {CogIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {socialLinksField} from './fields/socialLinksField'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'basic', title: 'Basic', default: true},
    {name: 'homepage', title: 'Homepage'},
    {name: 'sponsorship', title: 'Sponsorship Defaults'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Site Title',
      type: 'string',
      group: 'basic',
      validation: (Rule) => [Rule.required().error('Site title is required')],
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      group: 'basic',
      description: 'Short strapline used in metadata and hero copy',
    }),
    defineField({
      name: 'description',
      title: 'Site Description',
      type: 'text',
      rows: 3,
      group: 'basic',
      description: 'Short blurb for SEO and the newsletter module',
    }),
    {
      ...socialLinksField(),
      group: 'basic',
    },
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      group: 'basic',
      validation: (Rule) => [Rule.email().warning('Use a valid email address')],
    }),
    defineField({
      name: 'newsletter',
      title: 'Newsletter Copy',
      type: 'object',
      group: 'basic',
      fields: [
        defineField({name: 'headline', type: 'string'}),
        defineField({name: 'description', type: 'text', rows: 2}),
        defineField({name: 'ctaLabel', type: 'string', title: 'CTA Label'}),
      ],
    }),
    defineField({
      name: 'ctaDefaults',
      title: 'CTA Defaults',
      type: 'object',
      group: 'basic',
      description: 'Fallback CTA labels used when documents do not override them',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({
          name: 'reviewCta',
          title: 'Review CTA',
          type: 'string',
          initialValue: 'Add to your Planner',
          validation: (Rule) => [Rule.required().error('Provide a default CTA for reviews')],
        }),
        defineField({
          name: 'guideCta',
          title: 'Guide CTA',
          type: 'string',
          initialValue: 'Save Places',
          validation: (Rule) => [Rule.required().error('Provide a default CTA for guides')],
        }),
        defineField({
          name: 'artistStoryCta',
          title: 'Artist Story CTA',
          type: 'string',
          initialValue: 'Meet the artist',
          validation: (Rule) => [Rule.required().error('Provide a default CTA for artist stories')],
        }),
      ],
    }),
    
    // Homepage Configuration
    defineField({
      name: 'heroArticle',
      title: 'Hero Article',
      type: 'reference',
      group: 'homepage',
      to: [{type: 'article'}, {type: 'artistStory'}, {type: 'guide'}],
      description: 'Main featured content in the hero section',
      validation: (Rule) => [Rule.required().warning('Select a hero article for the homepage')],
    }),
    defineField({
      name: 'featuredReviews',
      title: 'Featured Exhibition Reviews',
      type: 'array',
      group: 'homepage',
      description: 'Showcase 3-4 exhibition reviews on the homepage',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'article'}],
          options: {
            filter: 'contentType == "exhibition-review" && publishStatus == "published"',
          },
        }),
      ],
      validation: (Rule) => [
        Rule.max(4).warning('Limit to 4 featured reviews for optimal layout'),
        Rule.unique().error('Each review can only be featured once'),
      ],
    }),
    defineField({
      name: 'showNewsSection',
      title: 'Show News Section',
      type: 'boolean',
      group: 'homepage',
      description: 'Display a news section with the latest news articles',
      initialValue: true,
    }),
    defineField({
      name: 'newsCount',
      title: 'Number of News Items',
      type: 'number',
      group: 'homepage',
      description: 'How many recent news articles to show (1-5)',
      initialValue: 3,
      hidden: ({document}) => !document?.showNewsSection,
      validation: (Rule) => [
        Rule.integer().positive().error('Must be a positive number'),
        Rule.min(1).max(5).warning('Recommended: 2-3 news items'),
      ],
    }),
    defineField({
      name: 'featuredContent',
      title: 'Featured Content Mix',
      type: 'array',
      group: 'homepage',
      description: 'Flexible section: mix books, films, artist stories, or any content you choose',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'article'}, {type: 'artistStory'}, {type: 'guide'}],
        }),
      ],
      validation: (Rule) => [
        Rule.max(6).warning('Limit to 6 items for optimal display'),
        Rule.unique().error('Each piece of content can only be featured once'),
      ],
    }),
    defineField({
      name: 'sponsorshipDefaults',
      title: 'Sponsorship Defaults',
      type: 'object',
      group: 'sponsorship',
      fields: [
        defineField({
          name: 'disclaimer',
          type: 'text',
          rows: 2,
          title: 'Global Disclaimer',
          initialValue: 'This content is sponsored. All opinions are our own.',
        }),
        defineField({
          name: 'badgeStyle',
          type: 'string',
          title: 'Badge Style',
          options: {
            list: [
              {title: 'Subtle', value: 'subtle'},
              {title: 'Bold', value: 'bold'},
            ],
            layout: 'radio',
          },
          initialValue: 'subtle',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      tagline: 'tagline',
      email: 'contactEmail',
    },
    prepare({title, tagline, email}) {
      const subtitleParts = [tagline, email].filter(Boolean)
      return {
        title: title || 'Site Settings',
        subtitle: subtitleParts.join(' • ') || 'Configure global defaults',
        media: CogIcon,
      }
    },
  },
})
