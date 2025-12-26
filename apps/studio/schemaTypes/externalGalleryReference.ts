import {EarthGlobeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const externalGalleryReference = defineType({
  name: 'externalGalleryReference',
  title: 'GraphQL Gallery Reference',
  type: 'object',
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: 'id',
      title: 'GraphQL Gallery ID',
      type: 'string',
      validation: (Rule) => [Rule.required().error('GraphQL gallery ID is required')],
    }),
    defineField({name: 'name', title: 'Gallery Name', type: 'string'}),
    defineField({name: 'city', title: 'City', type: 'string'}),
    defineField({name: 'address', title: 'Address', type: 'string'}),
    defineField({name: 'website', title: 'Website', type: 'url'}),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'city',
    },
    prepare({title, subtitle}) {
      return {
        title: title || 'GraphQL gallery',
        subtitle: subtitle || 'External reference',
      }
    },
  },
})
