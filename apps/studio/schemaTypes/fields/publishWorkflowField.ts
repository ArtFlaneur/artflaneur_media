import {defineField} from 'sanity'

const workflowStatuses = [
  {title: '📝 Draft', value: 'draft'},
  {title: '👁️ In Review', value: 'inReview'},
  {title: '⚠️ Needs Revision', value: 'needsRevision'},
  {title: '✅ Approved', value: 'approved'},
  {title: '🕐 Scheduled', value: 'scheduled'},
  {title: '🚀 Published', value: 'published'},
  {title: '📦 Archived', value: 'archived'},
]

export const workflowFields = () => [
  defineField({
    name: 'publishStatus',
    title: 'Workflow Status',
    type: 'string',
    description: 'Single source of truth for editorial and publishing state',
    options: {
      list: workflowStatuses,
      layout: 'radio',
    },
    initialValue: 'draft',
    validation: (Rule) => [Rule.required().error('Workflow status is required before publishing')],
  }),
  defineField({
    name: 'publishedAt',
    title: 'Published At',
    type: 'datetime',
    description: 'Visible timestamp used for feeds, search, and schema.org',
    hidden: ({document}) => {
      const status = typeof document?.publishStatus === 'string' ? document.publishStatus : undefined
      return !status || ['draft', 'inReview', 'needsRevision', 'scheduled'].includes(status)
    },
    validation: (Rule) => [
      Rule.custom((value, context) => {
        const status = (context.document as {publishStatus?: string} | undefined)?.publishStatus
        if (status && typeof status !== 'string') return true
        if (!status) return true
        if (['published', 'archived'].includes(status) && !value) {
          return 'Published content must include a publish timestamp'
        }
        if (value && new Date(value) > new Date() && status !== 'scheduled') {
          return 'Publish timestamp cannot be in the future unless scheduled'
        }
        return true
      }),
    ],
  }),
  defineField({
    name: 'scheduledPublishAt',
    title: 'Schedule Publication',
    type: 'datetime',
    description: 'Only visible when the workflow status is set to scheduled',
    hidden: ({document}) => document?.publishStatus !== 'scheduled',
    validation: (Rule) => [
      Rule.custom((scheduledAt, context) => {
        const status = (context.document as {publishStatus?: string} | undefined)?.publishStatus
        if (status !== 'scheduled') return true
        if (!scheduledAt) {
          return 'Provide a future date to schedule publication'
        }
        if (new Date(scheduledAt) <= new Date()) {
          return 'Scheduled publish date must be in the future'
        }
        return true
      }).warning('Schedules should typically be within 90 days'),
    ],
  }),
]
