import {ListIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const factTable = defineType({
  name: 'factTable',
  title: 'Fact Table',
  type: 'object',
  icon: ListIcon,
  fields: [
    defineField({
      name: 'caption',
      title: 'Table Caption',
      type: 'string',
      description: 'Short label describing what the facts are about',
      validation: (Rule) => [Rule.max(120).warning('Captions work best under 120 characters')],
    }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      description: 'Structured pairs that AI models can easily parse',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'factRow',
          title: 'Fact Row',
          fields: [
            defineField({
              name: 'parameter',
              title: 'Parameter',
              type: 'string',
              validation: (Rule) => [Rule.required().error('Each row needs a parameter label')],
            }),
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string',
              validation: (Rule) => [Rule.required().error('Each row needs a value')],
            }),
          ],
        }),
      ],
      validation: (Rule) => [
        Rule.required().error('Add at least one fact row'),
        Rule.max(12).warning('Keep fact tables concise (max 12 rows)'),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'caption',
      rows: 'rows',
    },
    prepare({title, rows}) {
      return {
        title: title || 'Fact Table',
        subtitle: `${rows?.length ?? 0} rows`,
      }
    },
  },
})
