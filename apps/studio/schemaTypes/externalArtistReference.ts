import {UserIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const externalArtistReference = defineType({
  name: 'externalArtistReference',
  title: 'GraphQL Artist Reference',
  type: 'object',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'id',
      title: 'GraphQL Artist ID',
      type: 'string',
      validation: (Rule) => [Rule.required().error('GraphQL artist ID is required')],
    }),
    defineField({name: 'name', title: 'Artist Name', type: 'string'}),
    defineField({name: 'country', title: 'Country', type: 'string'}),
    defineField({name: 'description', title: 'Artist Bio (GraphQL)', type: 'text'}),
    defineField({name: 'birthYear', title: 'Birth Year', type: 'number'}),
    defineField({name: 'deathYear', title: 'Death Year', type: 'number'}),
    defineField({name: 'wikipediaUrl', title: 'Wikipedia URL', type: 'url'}),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'country',
    },
    prepare({title, subtitle}) {
      return {
        title: title || 'GraphQL artist',
        subtitle: subtitle || 'External reference',
      }
    },
  },
})
