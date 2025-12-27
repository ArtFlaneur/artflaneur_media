import {defineField} from 'sanity'

type FieldOverrides = Record<string, unknown>

export const workingHoursField = (overrides: FieldOverrides = {}) =>
  defineField({
    name: 'workingHours',
    title: 'Working Hours',
    type: 'text',
    rows: 4,
    description: 'One entry per line, e.g. "Mon-Fri 10:00-18:00" or "Sun Closed"',
    validation: (Rule) => [
      Rule.max(600).warning('Working hours should be concise (max 600 characters)'),
    ],
    ...overrides,
  })
