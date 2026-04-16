import type { GlobalConfig } from 'payload'
import { autoTranslateGlobalHook } from '../hooks/translate'

export const Hero: GlobalConfig = {
  slug: 'hero',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [autoTranslateGlobalHook],
  },
  fields: [
    { name: 'eyebrow', type: 'text', localized: true },
    { name: 'titleLine1', type: 'text', localized: true },
    { name: 'titleLine2', type: 'text', localized: true },
    { name: 'subtitle', type: 'textarea', localized: true },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'First Frame of Video',
    },
    {
      name: 'vimeoUrl',
      type: 'text',
      label: 'Vimeo Video URL',
      admin: {
        description: 'Paste the Vimeo video URL (e.g. https://vimeo.com/1181594121)',
      },
    },
    {
      name: 'ctas',
      type: 'group',
      fields: [
        { name: 'primary', type: 'text', localized: true },
        { name: 'secondary', type: 'text', localized: true },
      ],
    },
    { name: 'scrollText', type: 'text', localized: true },
    {
      name: 'stats',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'value', type: 'text', localized: true },
        { name: 'label', type: 'text', localized: true },
      ],
    },
  ],
}
