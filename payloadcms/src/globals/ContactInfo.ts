import type { GlobalConfig } from 'payload'
import { autoTranslateGlobalHook } from '../hooks/translate'

export const ContactInfo: GlobalConfig = {
  slug: 'contact-info',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [autoTranslateGlobalHook],
  },
  fields: [
    {
      name: 'map',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', localized: true },
        { name: 'title', type: 'text', localized: true },
        { name: 'subtitle', type: 'textarea', localized: true },
        { name: 'tooltipLabel', type: 'text', localized: true },
        { name: 'tooltipContact', type: 'text', localized: true },
      ],
    },
    {
      name: 'locations',
      type: 'array',
      maxRows: 3,
      fields: [
        { name: 'name', type: 'text', localized: true },
        { name: 'address', type: 'text', localized: true },
        { name: 'phone', type: 'text', localized: true },
        { name: 'email', type: 'text', localized: true },
      ],
    },
    {
      name: 'formLabels',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', localized: true },
        { name: 'title', type: 'text', localized: true },
        { name: 'subtitle', type: 'textarea', localized: true },
        { name: 'addressLabel', type: 'text', localized: true },
        { name: 'infoLabel', type: 'text', localized: true },
        { name: 'mapsLabel', type: 'text', localized: true },
      ],
    },
  ],
}
