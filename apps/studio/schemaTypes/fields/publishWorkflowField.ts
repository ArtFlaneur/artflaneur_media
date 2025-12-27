import {defineField} from 'sanity'

export const editorialWorkflowField = () =>
  defineField({
    name: 'editorialStatus',
    title: 'Editorial Status',
    type: 'string',
    description: 'Internal workflow status for editors',
    options: {
      list: [
        {title: '👁️ In Review', value: 'inReview'},
        {title: '⚠️ Needs Revision', value: 'needsRevision'},
        {title: '✅ Approved', value: 'approved'},
      ],
      layout: 'radio',
    },
    initialValue: 'inReview',
    validation: (Rule) => [Rule.required().error('Editorial status is required')],
  })

export const publishWorkflowFields = () => [
  defineField({
    name: 'publishStatus',
    title: 'Publication Status',
    type: 'string',
    options: {
      list: [
        {title: '📝 Draft', value: 'draft'},
        {title: '🕐 Scheduled', value: 'scheduled'},
        {title: '✅ Published', value: 'published'},
        {title: '📦 Archived', value: 'archived'},
      ],
      layout: 'radio',
    },
    initialValue: 'draft',
    validation: (Rule) => [Rule.required().error('Publication status is required')],
  }),
  defineField({
    name: 'publishedAt',
    title: 'Published At',
    type: 'datetime',
    description: 'Visible publish timestamp',
    hidden: ({document}) => document?.publishStatus === 'draft',
  }),
  defineField({
    name: 'scheduledPublishAt',
    title: 'Schedule Publication',
    type: 'datetime',
    description: 'Schedule publication for the future',
    hidden: ({document}) => document?.publishStatus !== 'scheduled',
    validation: (Rule) => [
      Rule.custom((scheduledAt, context) => {
        const status = (context.document as {publishStatus?: string} | undefined)?.publishStatus
        if (status === 'scheduled' && !scheduledAt) {
          return 'Scheduled content must have a publication date'
        }
        if (scheduledAt && new Date(scheduledAt) <= new Date()) {
          return 'Scheduled publish date must be in the future'
        }
        return true
      }),
    ],
  }),
]
