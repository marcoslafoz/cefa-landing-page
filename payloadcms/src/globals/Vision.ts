import type { GlobalConfig } from 'payload'
import { autoTranslateGlobalHook } from '../hooks/translate'

export const Vision: GlobalConfig = {
  slug: 'vision',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [autoTranslateGlobalHook],
  },
  fields: [
    { name: 'eyebrow', type: 'text', localized: true },
    { name: 'title', type: 'text', localized: true },
    { name: 'body', type: 'textarea', localized: true },
    { name: 'cta', type: 'text', localized: true },
    {
      name: 'values',
      type: 'array',
      maxRows: 6,
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'text', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Image Gallery',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          localized: true,
          label: 'Alt Text',
        },
      ],
    },
  ],
}
