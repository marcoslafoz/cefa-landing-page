import type { GlobalConfig } from 'payload'
import { autoTranslateGlobalHook } from '../hooks/translate'

export const Quote: GlobalConfig = {
  slug: 'quote',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [autoTranslateGlobalHook],
  },
  fields: [
    { name: 'text', type: 'textarea', localized: true, required: true },
    { name: 'philosophy', type: 'text', localized: true },
  ],
}
