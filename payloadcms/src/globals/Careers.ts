import type { GlobalConfig } from 'payload'
import { autoTranslateGlobalHook } from '../hooks/translate'

export const Careers: GlobalConfig = {
  slug: 'careers',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [autoTranslateGlobalHook],
  },
  fields: [
    { name: 'title', type: 'text', localized: true },
    { name: 'subtitle', type: 'textarea', localized: true },
    { name: 'email', type: 'text' },
    { name: 'emailLabel', type: 'text', localized: true },
    { name: 'phoneLabel', type: 'text', localized: true },
    { name: 'phoneHours', type: 'text', localized: true },
    { name: 'cvHint', type: 'text', localized: true },
    { name: 'linkedinCta', type: 'text', localized: true },
    { name: 'linkedinShort', type: 'text', localized: true },
  ],
}
