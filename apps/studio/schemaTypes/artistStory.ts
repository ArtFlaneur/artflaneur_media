import {defineArrayMember, defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons'
import {appCtaField, schemaMarkupField, seoField, slugField, summaryField} from './fields/commonFields'
import {publishWorkflowFields} from './fields/publishWorkflowField'
import {sponsorshipField} from './fields/sponsorshipField'
import GraphqlArtistInput from './artistStory/GraphqlArtistInput'

export const artistStory = defineType({
  name: 'artistStory',
  title: 'Artist Story',
  type: 'document',
  icon: UserIcon,
  groups: [
    {name: 'content', title: 'Content', default: true, icon: UserIcon},
    {name: 'publishing', title: 'Publishing', icon: UserIcon},
    {name: 'metadata', title: 'SEO & Metadata', icon: UserIcon},
    {name: 'sponsorship', title: 'Sponsorship', icon: UserIcon},
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
      fields: [defineField({name: 'alt', type: 'string', title: 'Alt text'})],
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
            defineField({name: 'alt', type: 'string', title: 'Alt text'}),
            defineField({name: 'caption', type: 'string', title: 'Caption'}),
            defineField({name: 'title', type: 'string', title: 'Artwork Title'}),
            defineField({name: 'year', type: 'string', title: 'Year'}),
          ],
        }),
      ],
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
    ...publishWorkflowFields().map((field) => ({
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
    },
    prepare({title, artist, media, sponsored}) {
      const subtitle = [sponsored ? '💰 Sponsored' : null, artist].filter(Boolean).join(' • ')
      return {
        title: title || 'Untitled artist story',
        subtitle: subtitle || 'Artist Story',
        media,
      }
    },
  },
})
