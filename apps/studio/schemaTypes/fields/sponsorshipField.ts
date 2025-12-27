import {defineField} from 'sanity'

export const sponsorshipField = () =>
  defineField({
    name: 'sponsorship',
    title: 'Sponsorship',
    type: 'object',
    options: {collapsible: true, collapsed: true},
    fields: [
      defineField({
        name: 'enabled',
        title: 'Is Sponsored Content',
        type: 'boolean',
        initialValue: false,
      }),
      defineField({
        name: 'sponsor',
        title: 'Sponsor',
        type: 'reference',
        to: [{type: 'sponsor'}],
        hidden: ({parent}) => !parent?.enabled,
        validation: (Rule) => [
          Rule.custom((value, context) => {
            const enabled = (context.parent as {enabled?: boolean} | undefined)?.enabled
            if (enabled && !value) {
              return 'Select a sponsor for sponsored content'
            }
            return true
          }),
        ],
      }),
      defineField({
        name: 'type',
        title: 'Sponsorship Type',
        type: 'string',
        options: {
          list: [
            {title: 'Paid Content', value: 'paid'},
            {title: 'Partnership', value: 'partnership'},
            {title: 'Affiliate', value: 'affiliate'},
          ],
          layout: 'radio',
        },
        initialValue: 'paid',
        hidden: ({parent}) => !parent?.enabled,
      }),
      defineField({
        name: 'customDisclaimer',
        title: 'Custom Disclaimer',
        type: 'text',
        rows: 2,
        description: 'Override the default sponsorship disclaimer',
        hidden: ({parent}) => !parent?.enabled,
      }),
      defineField({
        name: 'badgePlacement',
        title: 'Badge Placement',
        type: 'string',
        options: {
          list: [
            {title: 'Use sponsor default', value: 'default'},
            {title: 'Top of content', value: 'top'},
            {title: 'After title', value: 'afterTitle'},
            {title: 'Bottom of content', value: 'bottom'},
          ],
          layout: 'radio',
        },
        initialValue: 'default',
        hidden: ({parent}) => !parent?.enabled,
      }),
    ],
  })
