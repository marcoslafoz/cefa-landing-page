import type { GlobalConfig } from 'payload'
import { autoTranslateGlobalHook } from '../hooks/translate'

export const FAQ: GlobalConfig = {
  slug: 'faq',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [autoTranslateGlobalHook],
  },
  fields: [
    { name: 'eyebrow', type: 'text', localized: true },
    { name: 'title', type: 'text', localized: true },
    {
      name: 'questions',
      type: 'array',
      fields: [
        { name: 'question', type: 'text', localized: true },
        { name: 'answer', type: 'textarea', localized: true },
      ],
    },
  ],
}
