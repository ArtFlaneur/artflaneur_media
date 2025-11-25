import {defineArrayMember, defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Site Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'navigation',
      title: 'Navigation Menu',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            {name: 'label', type: 'string', title: 'Label'},
            {name: 'url', type: 'string', title: 'URL'},
            {name: 'page', type: 'reference', to: [{type: 'review'}, {type: 'guide'}, {type: 'artistStory'}, {type: 'landingPage'}], title: 'Page'},
          ],
        }),
      ],
    }),
    defineField({
      name: 'footer',
      title: 'Footer',
      type: 'object',
      fields: [
        {
          name: 'links',
          type: 'array',
          title: 'Footer Links',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                {name: 'label', type: 'string', title: 'Label'},
                {name: 'url', type: 'string', title: 'URL'},
              ],
            }),
          ],
        },
        {name: 'copyright', type: 'string', title: 'Copyright Text'},
      ],
    }),
    defineField({
      name: 'tickerMessages',
      title: 'Ticker Messages',
      type: 'array',
      description: 'Messages that will appear in the scrolling ticker at the top of the site',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            {
              name: 'message',
              type: 'string',
              title: 'Message',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'isActive',
              type: 'boolean',
              title: 'Active',
              description: 'Show this message in the ticker',
              initialValue: true,
            },
          ],
          preview: {
            select: {
              title: 'message',
              isActive: 'isActive',
            },
            prepare({title, isActive}) {
              return {
                title: title,
                subtitle: isActive ? '✓ Active' : '✗ Inactive',
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'socialMedia',
      title: 'Social Media',
      type: 'object',
      fields: [
        {name: 'instagram', type: 'url', title: 'Instagram'},
        {name: 'facebook', type: 'url', title: 'Facebook'},
        {name: 'twitter', type: 'url', title: 'Twitter/X'},
        {name: 'linkedin', type: 'url', title: 'LinkedIn'},
      ],
    }),
    defineField({
      name: 'citySelector',
      title: 'City Selector',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            {name: 'name', type: 'string', title: 'City Name'},
            {name: 'slug', type: 'slug', title: 'Slug'},
          ],
        }),
      ],
    }),
    defineField({
      name: 'sponsorshipSettings',
      title: 'Sponsorship Settings',
      type: 'object',
      fields: [
        {
          name: 'defaultDisclaimer',
          type: 'text',
          title: 'Default Sponsor Disclaimer',
          rows: 2,
          description: 'Default text for sponsored content disclaimer',
          initialValue: 'This content is sponsored. All opinions are our own.',
        },
        {
          name: 'showSponsorBadge',
          type: 'string',
          title: 'Show "Sponsored" Badge',
          options: {
            list: [
              {title: 'Show badge', value: 'show'},
              {title: 'Hide badge', value: 'hide'},
            ],
            layout: 'radio',
          },
          description: 'Controls whether a “Sponsored” badge should appear by default.',
          initialValue: 'show',
        },
        {
          name: 'badgeStyle',
          type: 'string',
          title: 'Global Badge Style',
          options: {
            list: [
              {title: 'Subtle', value: 'subtle'},
              {title: 'Bold', value: 'bold'},
              {title: 'Minimal', value: 'minimal'},
              {title: 'Card', value: 'card'},
            ],
            layout: 'radio',
          },
          initialValue: 'subtle',
        },
        {
          name: 'defaultBadgeTemplate',
          type: 'string',
          title: 'Default Badge Template',
          options: {
            list: [
              {title: 'Supported by {logo}', value: 'supportedBy'},
              {title: 'In partnership with {logo}', value: 'partnershipWith'},
              {title: 'Presented by {logo}', value: 'presentedBy'},
              {title: '{logo} presents', value: 'presents'},
            ],
            layout: 'radio',
          },
          initialValue: 'supportedBy',
          description: 'Default template if not specified by sponsor',
        },
        {
          name: 'logoSizeDefaults',
          type: 'object',
          title: 'Logo Size Defaults',
          fields: [
            {
              name: 'horizontal',
              type: 'object',
              title: 'Horizontal Logos',
              fields: [
                {name: 'maxWidth', type: 'number', title: 'Max Width (px)', initialValue: 200},
                {name: 'maxHeight', type: 'number', title: 'Max Height (px)', initialValue: 40},
              ],
            },
            {
              name: 'vertical',
              type: 'object',
              title: 'Vertical Logos',
              fields: [
                {name: 'maxWidth', type: 'number', title: 'Max Width (px)', initialValue: 100},
                {name: 'maxHeight', type: 'number', title: 'Max Height (px)', initialValue: 80},
              ],
            },
            {
              name: 'square',
              type: 'object',
              title: 'Square Logos',
              fields: [
                {name: 'maxWidth', type: 'number', title: 'Max Width (px)', initialValue: 60},
                {name: 'maxHeight', type: 'number', title: 'Max Height (px)', initialValue: 60},
              ],
            },
          ],
        },
      ],
    }),
  ],
})