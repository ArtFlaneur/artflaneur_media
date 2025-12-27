import {defineArrayMember, defineField, defineType} from 'sanity'
import {CheckmarkCircleIcon, DocumentIcon, StarIcon, UserIcon} from '@sanity/icons'
import {appCtaField, schemaMarkupField, seoField, slugField, summaryField} from './fields/commonFields'
import {workflowFields} from './fields/publishWorkflowField'
import {sponsorshipField} from './fields/sponsorshipField'
import GraphqlArtistInput from './artistStory/GraphqlArtistInput'

export const artistStory = defineType({
  name: 'artistStory',
  title: 'Artist Story',
  type: 'document',
  icon: UserIcon,
  groups: [
    {name: 'content', title: 'Content', default: true, icon: UserIcon},
    {name: 'publishing', title: 'Workflow', icon: CheckmarkCircleIcon},
    {name: 'metadata', title: 'SEO & Metadata', icon: DocumentIcon},
    {name: 'sponsorship', title: 'Sponsorship', icon: StarIcon},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => [Rule.required().error('Title is required to publish an artist story')],
    }),
    slugField({group: 'content'}),
    summaryField({group: 'content'}),
    defineField({
      name: 'externalArtist',
      title: 'GraphQL Artist',
      type: 'externalArtistReference',
      group: 'content',
      description: 'Lock this story to a canonical artist entry from GraphQL',
      components: {input: GraphqlArtistInput},
      validation: (Rule) => [Rule.required().error('Select an artist from the GraphQL catalogue to publish')],
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      description: 'Primary image used anywhere this story is featured',
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          description: 'Describe the portrait for readers using assistive tech',
          validation: (Rule) => [Rule.required().error('Alt text is required for accessibility')],
        }),
      ],
      validation: (Rule) => [Rule.required().error('Portrait image is required for artist stories')],
    }),
    defineField({
      name: 'biography',
      title: 'Biography',
      type: 'blockContent',
      group: 'content',
    }),
    defineField({
      name: 'artworkGallery',
      title: 'Artwork Gallery',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alt text',
              description: 'Briefly describe the artwork for context',
              validation: (Rule) => [Rule.required().error('Every artwork needs alternative text')],
            }),
            defineField({name: 'caption', type: 'string', title: 'Caption'}),
            defineField({name: 'title', type: 'string', title: 'Artwork Title'}),
            defineField({name: 'year', type: 'string', title: 'Year'}),
          ],
        }),
      ],
    }),
    defineField({
      name: 'multimediaSections',
      title: 'Multimedia Sections',
      description: 'Video-first storytelling blocks with optional fallback imagery',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          name: 'multimediaBlock',
          title: 'Multimedia Block',
          type: 'object',
          fieldsets: [
            {name: 'cta', title: 'Call To Action', options: {columns: 2}},
          ],
          fields: [
            defineField({
              name: 'title',
              title: 'Section Title',
              type: 'string',
              validation: (Rule) => [Rule.required().error('Each multimedia block needs a title')],
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
              description: 'Short context for the featured work or exhibition',
              validation: (Rule) => [Rule.required().error('Add a short description for context')],
            }),
            defineField({
              name: 'videoUrl',
              title: 'Video URL',
              type: 'url',
              description: 'YouTube, Vimeo, or hosted MP4 link (autoplays on artist page)',
            }),
            defineField({
              name: 'fallbackImage',
              title: 'Fallback Image',
              type: 'image',
              options: {hotspot: true},
              description: 'Shown when video is not available or for mobile fallback',
              fields: [
                defineField({
                  name: 'alt',
                  type: 'string',
                  validation: (Rule) => [Rule.required().error('Alt text is required for the fallback image')],
                }),
                defineField({name: 'caption', type: 'string', title: 'Caption'}),
              ],
            }),
            defineField({
              name: 'ctaText',
              title: 'CTA Label',
              type: 'string',
              fieldset: 'cta',
            }),
            defineField({
              name: 'ctaUrl',
              title: 'CTA URL',
              type: 'url',
              fieldset: 'cta',
            }),
          ],
          validation: (Rule) => [
            Rule.custom((value) => {
              if (!value) return true
              if (!value.videoUrl && !value.fallbackImage) {
                return 'Add a video URL or provide a fallback image'
              }
              return true
            }),
          ],
        }),
      ],
      validation: (Rule) => [Rule.max(4).warning('Prioritize up to four multimedia blocks per story')],
    }),
    defineField({
      name: 'relatedExhibitions',
      title: 'Related Exhibitions',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'externalExhibitionReference'})],
      description: 'Highlight key exhibitions from the GraphQL catalogue',
    }),
    defineField({
      name: 'upcomingExhibitions',
      title: 'Upcoming Exhibitions',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'externalExhibitionReference'})],
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'author'}],
      group: 'publishing',
      description: 'Credits the ambassador or editor responsible for the story',
      validation: (Rule) => [Rule.required().error('Select the author curating this story')],
    }),
    ...workflowFields().map((field) => ({
      ...field,
      group: 'publishing',
    })),
    defineField({
      name: 'featureWeight',
      title: 'Feature Priority',
      type: 'number',
      group: 'publishing',
      description: 'Optional priority score for curated modules',
      validation: (Rule) => [Rule.min(0).max(100).warning('Use 0-100 to keep priorities scoped')],
    }),
    seoField({group: 'metadata'}),
    schemaMarkupField({group: 'metadata'}),
    appCtaField({group: 'metadata'}),
    {
      ...sponsorshipField(),
      group: 'sponsorship',
    },
  ],
  preview: {
    select: {
      title: 'title',
      artist: 'externalArtist.name',
      media: 'portrait',
      sponsored: 'sponsorship.enabled',
      author: 'author.name',
    },
    prepare({title, artist, media, sponsored, author}) {
      const subtitle = [
        sponsored ? '💰 Sponsored' : null,
        artist,
        author ? `By ${author}` : null,
      ]
        .filter(Boolean)
        .join(' • ')
      return {
        title: title || 'Untitled artist story',
        subtitle: subtitle || 'Artist Story',
        media,
      }
    },
  },
})
