import {defineField, defineType} from 'sanity'
import {PlayIcon} from '@sanity/icons'

export const filmReviewEntry = defineType({
  name: 'filmReviewEntry',
  title: 'Film Review Entry',
  type: 'object',
  icon: PlayIcon,
  fieldsets: [
    {
      name: 'releaseWindow',
      title: 'Release & Runtime',
      options: {columns: 2},
    },
    {
      name: 'availability',
      title: 'Availability',
      options: {columns: 2},
    },
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => [
        Rule.required().error('Each entry needs a film title'),
        Rule.max(120).warning('Keep titles concise (under 120 characters)'),
      ],
    }),
    defineField({
      name: 'director',
      type: 'string',
      validation: (Rule) => [
        Rule.required().error('List the director so the review has context'),
      ],
    }),
    defineField({
      name: 'summary',
      title: 'Summary or Verdict',
      type: 'text',
      rows: 4,
      description: 'Short verdict that appears next to the film card',
      validation: (Rule) => [
        Rule.max(600).warning('Keep verdicts under 600 characters for readability'),
      ],
    }),
    defineField({
      name: 'still',
      title: 'Film Still',
      type: 'image',
      description: 'Wide still or poster that anchors the card layout',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          validation: (Rule) => [Rule.required().error('Describe the image for accessibility')],
        }),
        defineField({name: 'caption', type: 'string', title: 'Caption'}),
      ],
      validation: (Rule) => [
        Rule.warning('Add a still so every film card has a visual anchor'),
      ],
    }),
    defineField({
      name: 'rating',
      type: 'number',
      description: '1-5 rating specific to this film',
      validation: (Rule) => [
        Rule.min(1).max(5).warning('Use a 1-5 scale for ratings'),
        Rule.precision(1),
      ],
    }),
    defineField({
      name: 'releaseYear',
      type: 'number',
      fieldset: 'releaseWindow',
      description: 'Original release year for this film',
      validation: (Rule) => [
        Rule.integer().error('Release year must be a whole number'),
        Rule.min(1895).max(new Date().getFullYear() + 3).warning('Double check the release year'),
      ],
    }),
    defineField({
      name: 'duration',
      title: 'Duration (minutes)',
      type: 'number',
      fieldset: 'releaseWindow',
      validation: (Rule) => [
        Rule.integer().positive().warning('Runtime should be a positive number'),
        Rule.min(1).max(500).warning('Check unusually long or short runtimes'),
      ],
    }),
    defineField({
      name: 'whereToWatch',
      type: 'string',
      fieldset: 'availability',
      description: 'Streaming platform, festival, or cinema program',
    }),
    defineField({
      name: 'filmLink',
      title: 'Watch Link',
      type: 'url',
      fieldset: 'availability',
      description: 'Link to official site, streaming page, or trailer',
      validation: (Rule) => [
        Rule.uri({
          scheme: ['http', 'https'],
        }).error('Links must start with http:// or https://'),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      director: 'director',
      rating: 'rating',
      media: 'still',
    },
    prepare({title, director, rating, media}) {
      const ratingLabel = typeof rating === 'number' ? `${rating.toFixed(1)}/5` : 'No rating'
      return {
        title: title || 'Untitled film',
        subtitle: [director, ratingLabel].filter(Boolean).join(' • '),
        media: media || PlayIcon,
      }
    },
  },
})
