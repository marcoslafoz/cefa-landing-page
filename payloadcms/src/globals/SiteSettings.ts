import type { GlobalConfig } from 'payload'
import { autoTranslateGlobalHook } from '../hooks/translate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [autoTranslateGlobalHook],
  },
  fields: [
    {
      name: 'error404',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'subtitle', type: 'text', localized: true },
        { name: 'cta', type: 'text', localized: true },
      ],
    },
    {
      name: 'cookieBanner',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
        { name: 'accept', type: 'text', localized: true },
        { name: 'reject', type: 'text', localized: true },
        { name: 'settings', type: 'text', localized: true },
        { name: 'policy', type: 'text', localized: true },
      ],
    },
    {
      name: 'a11y',
      type: 'group',
      fields: [
        { name: 'skipToMain', type: 'text', localized: true, label: 'Skip to main content' },
      ],
    },
  ],
}
