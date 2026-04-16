import type { GlobalConfig } from 'payload'
import { autoTranslateGlobalHook } from '../hooks/translate'

export const Clients: GlobalConfig = {
  slug: 'clients',
  label: 'Clients',
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
      name: 'logos',
      type: 'array',
      label: 'Client Logos',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'name',
          type: 'text',
          label: 'Brand Name (Alt Text)',
        },
      ],
    },
  ],
}
