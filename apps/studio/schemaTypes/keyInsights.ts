import {DocumentIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const keyInsights = defineType({
  name: 'keyInsights',
  title: 'Key Insights',
  type: 'object',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
      initialValue: 'Key Insights',
  validation: (rule: any) => [
        rule.required().error('Provide a heading for the insights list'),
        rule.max(80).warning('Headings should stay under 80 characters'),
      ],
    }),
    defineField({
      name: 'insights',
      title: 'Insights',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'insight',
          title: 'Insight',
          fields: [
            defineField({
              name: 'insight',
              title: 'Insight Text',
              type: 'text',
              rows: 2,
              validation: (rule: any) => [
                rule.required().error('Write the insight text'),
                rule.max(280).warning('Insights should remain scannable (max 280 characters)'),
              ],
            }),
          ],
        }),
      ],
  validation: (rule: any) => [
        rule.required().error('Add at least one insight'),
        rule.min(3).warning('Aim for at least three insights to provide context'),
        rule.max(5).warning('Limit to five insights for clarity'),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'heading',
      count: 'insights.length',
    },
    prepare({title, count}) {
      return {
        title: title || 'Key Insights',
        subtitle: `${count ?? 0} insight${count === 1 ? '' : 's'}`,
      }
    },
  },
})
