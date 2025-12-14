import {defineArrayMember, defineField} from 'sanity'
import type {FieldDefinition} from 'sanity'

type FieldOverrides = Record<string, unknown>

type OverrideableFieldProps = {
  options?: unknown
  fields?: unknown
}

const withOverrides = (base: FieldDefinition & OverrideableFieldProps, overrides: FieldOverrides = {}) => {
  const merged: Record<string, unknown> = {
    ...(base as unknown as Record<string, unknown>),
    ...overrides,
  }

  if ('options' in overrides) {
    merged['options'] = (overrides as OverrideableFieldProps).options
  } else if ('options' in (base as unknown as Record<string, unknown>)) {
    merged['options'] = (base as OverrideableFieldProps).options
  } else {
    delete merged['options']
  }

  if ('fields' in overrides) {
    merged['fields'] = (overrides as OverrideableFieldProps).fields
  } else if ('fields' in (base as unknown as Record<string, unknown>)) {
    merged['fields'] = (base as OverrideableFieldProps).fields
  } else {
    delete merged['fields']
  }

  return merged as unknown as FieldDefinition & OverrideableFieldProps
}

export const slugField = (overrides: FieldOverrides = {}) =>
{
  const base: FieldDefinition = {
    name: 'slug',
    title: 'Slug',
    type: 'slug',
    options: {
      source: 'title',
      maxLength: 96,
    },
    validation: (Rule) => [
      Rule.required().error('Slug is required to generate a URL'),
      Rule.custom((slug?: {current?: string}) =>
        slug?.current && slug.current.length > 96 ? 'Slug cannot be longer than 96 characters' : true,
      ),
    ],
  }

  return defineField(withOverrides(base, overrides))
}

export const publishDateField = (overrides: FieldOverrides = {}) =>
{
  const base: FieldDefinition = {
    name: 'publishedAt',
    title: 'Published At',
    type: 'datetime',
    description: 'Controls scheduling, feeds, and schema timestamps',
    initialValue: () => new Date().toISOString(),
    validation: (Rule) => [Rule.required().error('Publication date is required')],
  }

  return defineField(withOverrides(base, overrides))
}

export const summaryField = (overrides: FieldOverrides = {}) =>
{
  const base: FieldDefinition = {
    name: 'summary',
    title: 'TL;DR Summary',
    type: 'text',
    rows: 3,
    description: '1–2 sentences that help AI and previews capture the core idea',
    validation: (Rule) => [
      Rule.required().error('Add a short summary so aggregators understand the piece'),
      Rule.max(260).warning('Summaries work best under 260 characters'),
    ],
  }

  return defineField(withOverrides(base, overrides))
}

export const appCtaField = (overrides: FieldOverrides = {}) =>
{
  const base: FieldDefinition = {
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
        validation: (Rule) => [
          Rule.required().error('CTA text is required when promoting the app'),
          Rule.max(140).warning('Keep CTAs short and action oriented'),
        ],
      }),
      defineField({
        name: 'deeplink',
        title: 'Deep Link',
        type: 'url',
        description: 'Link to the corresponding screen inside the app',
        validation: (Rule) => [
          Rule.uri({allowRelative: true}).warning('Use https:// or an app deeplink'),
        ],
      }),
    ],
  }

  return defineField(withOverrides(base, overrides))
}

export const seoField = (overrides: FieldOverrides = {}) =>
{
  const base: FieldDefinition = {
    name: 'seo',
    title: 'SEO Metadata',
    type: 'object',
    options: {collapsible: true, collapsed: true},
    fields: [
      defineField({
        name: 'metaTitle',
        title: 'Meta Title',
        type: 'string',
        validation: (Rule) => [Rule.max(60).warning('Meta titles truncate after ~60 characters')],
      }),
      defineField({
        name: 'metaDescription',
        title: 'Meta Description',
        type: 'text',
        rows: 3,
        validation: (Rule) => [
          Rule.max(160).warning('Meta descriptions truncate after ~160 characters'),
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
        validation: (Rule) => [
          Rule.max(10).warning('Stick to the most relevant keywords (max 10)'),
        ],
      }),
    ],
  }

  return defineField(withOverrides(base, overrides))
}

export const schemaMarkupField = (overrides: FieldOverrides = {}) =>
{
  const base: FieldDefinition = {
    name: 'schemaMarkup',
    title: 'Schema Markup (JSON-LD)',
    type: 'text',
    rows: 6,
    description: 'Optional JSON-LD snippet. Populate via plugin or paste valid JSON.',
    validation: (Rule) => [
      Rule.custom((value?: string) => {
        if (!value) return true
        try {
          JSON.parse(value)
          return true
        } catch (error) {
          return 'Schema markup must be valid JSON'
        }
      }),
    ],
  }

  return defineField(withOverrides(base, overrides))
}
