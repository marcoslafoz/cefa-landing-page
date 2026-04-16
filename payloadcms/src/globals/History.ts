import type { GlobalConfig } from 'payload'
import { autoTranslateGlobalHook } from '../hooks/translate'

export const History: GlobalConfig = {
  slug: 'history-content',
  label: 'History',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [autoTranslateGlobalHook],
  },
  fields: [
    { name: 'eyebrow', type: 'text', localized: true },
    { name: 'title', type: 'text', localized: true },
    { name: 'pageTitle', type: 'text', localized: true },
    { name: 'pageSubtitle', type: 'textarea', localized: true },
    {
      name: 'timeline',
      type: 'array',
      fields: [
        { name: 'year', type: 'text' },
        { name: 'text', type: 'textarea', localized: true },
      ],
    },
    { name: 'todayText', type: 'textarea', localized: true },
    { name: 'todayLabel', type: 'text', localized: true },
    {
      name: 'meta',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
  ],
}
