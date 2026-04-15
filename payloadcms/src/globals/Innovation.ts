import type { GlobalConfig } from 'payload'
import { autoTranslateGlobalHook } from '../hooks/translate'

export const Innovation: GlobalConfig = {
  slug: 'innovation',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [autoTranslateGlobalHook],
  },
  fields: [
    { name: 'eyebrow', type: 'text', localized: true },
    { name: 'title', type: 'text', localized: true },
    { name: 'subtitle', type: 'textarea', localized: true },
    {
      name: 'features',
      type: 'array',
      maxRows: 2,
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'text', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      maxRows: 2,
      fields: [
        { name: 'label', type: 'text', localized: true },
      ],
    },
    { name: 'loadingText', type: 'text', localized: true },
    { name: 'rotateText', type: 'text', localized: true },
  ],
}
