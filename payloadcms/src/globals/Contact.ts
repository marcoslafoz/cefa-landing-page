import type { GlobalConfig } from 'payload'
import { autoTranslateGlobalHook } from '../hooks/translate'

export const Contact: GlobalConfig = {
  slug: 'contact',
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
      label: 'Headquarters Section Text',
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
      label: 'Offices / Locations',
      fields: [
        { name: 'name', type: 'text', localized: true, label: 'Office Name' },
        { name: 'address', type: 'text', localized: true, label: 'Address' },
        { name: 'phone', type: 'text', label: 'Phone' },
        { name: 'email', type: 'text', label: 'Email' },
      ],
    },
    {
      name: 'formLabels',
      type: 'group',
      label: 'Contact Form Labels',
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
