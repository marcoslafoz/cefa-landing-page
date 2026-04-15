import type { GlobalConfig } from 'payload'
import { autoTranslateGlobalHook } from '../hooks/translate'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [autoTranslateGlobalHook],
  },
  fields: [
    {
      name: 'header',
      type: 'group',
      fields: [
        { name: 'company', type: 'text', localized: true },
        { name: 'products', type: 'text', localized: true },
        { name: 'clients', type: 'text', localized: true },
        { name: 'contact', type: 'text', localized: true },
        { name: 'contactCta', type: 'text', localized: true },
      ],
    },
    {
      name: 'footerColumns',
      type: 'group',
      fields: [
        { name: 'company', type: 'text', localized: true },
        { name: 'products', type: 'text', localized: true },
        { name: 'contact', type: 'text', localized: true },
      ],
    },
    {
      name: 'links',
      label: 'Etiquetas de enlaces',
      type: 'group',
      fields: [
        { name: 'mission', type: 'text', localized: true },
        { name: 'vision', type: 'text', localized: true },
        { name: 'innovation', type: 'text', localized: true },
        { name: 'history', type: 'text', localized: true },
        { name: 'awards', type: 'text', localized: true },
        { name: 'certifications', type: 'text', localized: true },
        { name: 'rd', type: 'text', localized: true },
        { name: 'presence', type: 'text', localized: true },
        { name: 'careers', type: 'text', localized: true },
        { name: 'clients', type: 'text', localized: true },
        { name: 'contact', type: 'text', localized: true },
        { name: 'dashboard', type: 'text', localized: true },
        { name: 'door', type: 'text', localized: true },
        { name: 'functional', type: 'text', localized: true },
        { name: 'exterior', type: 'text', localized: true },
      ],
    },
  ],
}
