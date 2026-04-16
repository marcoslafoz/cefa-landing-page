import type { GlobalConfig } from 'payload'
import { autoTranslateGlobalHook } from '../hooks/translate'

export const Mission: GlobalConfig = {
  slug: 'mission',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [autoTranslateGlobalHook],
  },
  fields: [
    { name: 'eyebrow', type: 'text', localized: true },
    { name: 'title', type: 'text', localized: true },
    { name: 'body1', type: 'textarea', localized: true },
    { name: 'body2', type: 'textarea', localized: true },
    { name: 'cta', type: 'text', localized: true },
    { name: 'badgeLabel', type: 'text', localized: true },
  ],
}
