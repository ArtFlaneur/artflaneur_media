
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
      name: 'artEvents',
      title: 'Art Events',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'artEvent'}]})],
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