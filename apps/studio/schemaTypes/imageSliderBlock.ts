import {ImageIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const imageSliderBlock = defineType({
  name: 'imageSliderBlock',
  title: 'Image Slider',
  type: 'object',
  icon: ImageIcon,
  description: 'Embed a swipeable set of related images inside long-form content blocks.',
  fields: [
    defineField({
      name: 'title',
      title: 'Slider Title',
      type: 'string',
      description: 'Optional label shown above the slider for editorial context.',
      validation: (Rule) => [Rule.max(80).warning('Keep slider titles under 80 characters')],
    }),
    defineField({
      name: 'images',
      title: 'Slides',
      type: 'array',
      description: 'Add 2-8 images that readers can swipe through.',
      of: [
        defineArrayMember({
          type: 'image',
          title: 'Slide Image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              description: 'Describe the slide for accessibility and SEO.',
              validation: (Rule) => [Rule.required().error('Alt text is required for every slide')],
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description: 'Optional caption displayed below the slide.',
              validation: (Rule) => [Rule.max(160).warning('Keep slide captions under 160 characters')],
            }),
          ],
        }),
      ],
      validation: (Rule) => [
        Rule.required().error('Add images before publishing an image slider'),
        Rule.min(2).error('Image sliders need at least two slides'),
        Rule.max(8).warning('Use no more than 8 slides to keep the page fast'),
      ],
    }),
    defineField({
      name: 'caption',
      title: 'Slider Caption',
      type: 'string',
      description: 'Optional caption that appears below the slider.',
      validation: (Rule) => [Rule.max(200).warning('Captions work best under 200 characters')],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      images: 'images',
    },
    prepare({title, images}) {
      const count = Array.isArray(images) ? images.length : 0
      return {
        title: title || 'Image Slider',
        subtitle: `${count} slide${count === 1 ? '' : 's'}`,
      }
    },
  },
})
