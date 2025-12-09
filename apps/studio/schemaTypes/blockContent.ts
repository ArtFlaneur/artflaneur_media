import {defineType, defineArrayMember} from 'sanity'

/**
 * This is the schema definition for the rich text fields used for
 * for this blog studio. When you import it in schemas.js it can be
 * reused in other parts of the studio with:
 *  {
 *    name: 'someName',
 *    title: 'Some title',
 *    type: 'blockContent'
 *  }
 */
export const blockContent = defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  validation: (rule: any) => rule.custom((blocks: any[]) => {
    if (!Array.isArray(blocks)) return true

    const headings = blocks
      .filter((block) => block?._type === 'block' && typeof block.style === 'string' && /^h[2-4]$/.test(block.style))
      .map((block) => block.style)

    if (!headings.length) return true

    if (headings[0] !== 'h2') {
      return 'Первый заголовок в тексте должен быть H2, чтобы сохранить правильную иерархию'
    }

    for (let i = 1; i < headings.length; i += 1) {
      const currentLevel = Number(headings[i].substring(1))
      const previousLevel = Number(headings[i - 1].substring(1))
      if (currentLevel - previousLevel > 1) {
        return `Нельзя перепрыгивать с ${headings[i - 1].toUpperCase()} на ${headings[i].toUpperCase()}`
      }
    }

    return true
  }),
  of: [
    defineArrayMember({
      title: 'Block',
      type: 'block',
      // Styles let you set what your user can mark up blocks with. These
      // correspond with HTML tags, but you can set any title or value
      // you want and decide how you want to deal with it where you want to
      // use your content.
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H2 — Main Section', value: 'h2'},
        {title: 'H3 — Subsection', value: 'h3'},
        {title: 'H4 — Detail', value: 'h4'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [
        {title: 'Bullet', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      // Marks let you mark up inline text in the block editor.
      marks: {
        // Decorators usually describe a single property – e.g. a typographic
        // preference or highlighting by editors.
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
        ],
        // Annotations can be any object structure – e.g. a link or a footnote.
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'factTable',
      title: 'Fact Table',
    }),
    defineArrayMember({
      type: 'keyInsights',
      title: 'Key Insights',
    }),
    // You can add additional types here. Note that you can't use
    // primitive types such as 'string' and 'number' in the same array
    // as a block type.
    defineArrayMember({
      type: 'image',
      name: 'image',
      title: 'Image',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Image description for SEO and accessibility',
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
          description: 'Image caption',
        },
      ],
    }),
  ],
})
