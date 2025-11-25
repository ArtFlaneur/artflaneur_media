
import {defineArrayMember, defineField, defineType} from 'sanity'

export const mapData = defineType({
  name: 'mapData',
  title: 'Map Data',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Map Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'galleries',
      title: 'Galleries',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'gallery'}]})],
    }),
    defineField({
      name: 'exhibitions',
      title: 'Featured Exhibitions',
      description: 'Optional highlighted exhibitions to surface on the map UI',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'exhibition'}]})],
    }),
    defineField({
      name: 'defaultCenter',
      title: 'Default Map Center',
      type: 'geopoint',
    }),
    defineField({
      name: 'defaultZoom',
      title: 'Default Zoom Level',
      type: 'number',
      initialValue: 12,
    }),
  ],
})