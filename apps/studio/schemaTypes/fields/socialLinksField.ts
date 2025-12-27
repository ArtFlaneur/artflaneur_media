import {defineField} from 'sanity'

export const socialLinksField = () =>
  defineField({
    name: 'social',
    title: 'Social Media',
    type: 'object',
    options: {collapsible: true, collapsed: true},
    fields: [
      defineField({name: 'instagram', type: 'url', title: 'Instagram'}),
      defineField({name: 'facebook', type: 'url', title: 'Facebook'}),
      defineField({name: 'twitter', type: 'url', title: 'Twitter / X'}),
      defineField({name: 'linkedin', type: 'url', title: 'LinkedIn'}),
      defineField({name: 'website', type: 'url', title: 'Website'}),
    ],
  })
