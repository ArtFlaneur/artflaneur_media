import {defineArrayMember, defineField} from 'sanity'

type FieldOverrides = Record<string, unknown>

const withOverrides = <T extends Record<string, unknown>>(base: T, overrides: FieldOverrides = {}) => {
  const merged = {
    ...base,
    ...overrides,
  }

  if ('options' in overrides) {
    merged.options = overrides.options
  } else if ('options' in base) {
    merged.options = base.options
  } else {
    delete merged.options
  }

  if ('fields' in overrides) {
    merged.fields = overrides.fields
  } else if ('fields' in base) {
    merged.fields = base.fields
  } else {
    delete merged.fields
  }

  return merged
}

export const slugField = (overrides: FieldOverrides = {}) =>
  defineField(withOverrides({
    name: 'slug',
    title: 'Slug',
    type: 'slug',
    options: {
      source: 'title',
      maxLength: 96,
    },
  validation: (rule: any) => [
      rule.required().error('Slug is required to generate a URL'),
      rule.custom((slug: {current?: string}) =>
        slug?.current && slug.current.length > 96
          ? 'Slug cannot be longer than 96 characters'
          : true
      ),
    ],
  }, overrides))

export const publishDateField = (overrides: FieldOverrides = {}) =>
  defineField(withOverrides({
    name: 'publishedAt',
    title: 'Published At',
    type: 'datetime',
    description: 'Controls scheduling, feeds, and schema timestamps',
    initialValue: () => new Date().toISOString(),
  validation: (rule: any) => rule.required().error('Publication date is required'),
  }, overrides))

export const summaryField = (overrides: FieldOverrides = {}) =>
  defineField(withOverrides({
    name: 'summary',
    title: 'TL;DR Summary',
    type: 'text',
    rows: 3,
    description: '1–2 sentences that help AI and previews capture the core idea',
  validation: (rule: any) => [
      rule.required().error('Add a short summary so aggregators understand the piece'),
      rule.max(260).warning('Summaries work best under 260 characters'),
    ],
  }, overrides))

export const appCtaField = (overrides: FieldOverrides = {}) =>
  defineField(withOverrides({
    name: 'appCta',
    title: 'App CTA',
    type: 'object',
    options: {collapsible: true, collapsed: true},
    description: 'Cross-promote deeper experiences inside the Art Flaneur app',
    fields: [
      defineField({
        name: 'text',
        title: 'CTA Text',
        type: 'string',
  validation: (rule: any) => [
          rule.required().error('CTA text is required when promoting the app'),
          rule.max(140).warning('Keep CTAs short and action oriented'),
        ],
      }),
      defineField({
        name: 'deeplink',
        title: 'Deep Link',
        type: 'url',
        description: 'Link to the corresponding screen inside the app',
  validation: (rule: any) => rule.uri({allowRelative: true}).warning('Use https:// or an app deeplink'),
      }),
    ],
  }, overrides))

export const seoField = (overrides: FieldOverrides = {}) =>
  defineField(withOverrides({
    name: 'seo',
    title: 'SEO Metadata',
    type: 'object',
    options: {collapsible: true, collapsed: true},
    fields: [
      defineField({
        name: 'metaTitle',
        title: 'Meta Title',
        type: 'string',
  validation: (rule: any) => [
          rule.max(60).warning('Meta titles truncate after ~60 characters'),
        ],
      }),
      defineField({
        name: 'metaDescription',
        title: 'Meta Description',
        type: 'text',
        rows: 3,
  validation: (rule: any) => [
          rule.max(160).warning('Meta descriptions truncate after ~160 characters'),
        ],
      }),
      defineField({
        name: 'keywords',
        title: 'Keywords',
        type: 'array',
        description: 'Optional supporting terms for search/AI models',
        of: [
          defineArrayMember({
            type: 'string',
            name: 'keyword',
            title: 'Keyword',
          }),
        ],
  validation: (rule: any) => rule.max(10).warning('Stick to the most relevant keywords (max 10)'),
      }),
    ],
  }, overrides))

export const schemaMarkupField = (overrides: FieldOverrides = {}) =>
  defineField(withOverrides({
    name: 'schemaMarkup',
    title: 'Schema Markup (JSON-LD)',
    type: 'text',
    rows: 6,
    description: 'Optional JSON-LD snippet. Populate via plugin or paste valid JSON.',
  validation: (rule: any) => rule.custom((value?: string) => {
      if (!value) return true
      try {
        JSON.parse(value)
        return true
      } catch (error) {
        return 'Schema markup must be valid JSON'
      }
    }),
  }, overrides))
