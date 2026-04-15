import type { GlobalConfig } from 'payload'
import { autoTranslateGlobalHook } from '../hooks/translate'

export const ResearchDevelopment: GlobalConfig = {
  slug: 'rd-content',
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
      name: 'stats',
      type: 'array',
      maxRows: 3,
      fields: [
        { name: 'value', type: 'text', localized: true },
        { name: 'label', type: 'text', localized: true },
      ],
    },
    {
      name: 'funders',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', localized: true },
        { name: 'programLabel', type: 'text', localized: true },
        {
          name: 'items',
          type: 'array',
          fields: [
            { name: 'name', type: 'text', localized: true },
            { name: 'description', type: 'textarea', localized: true },
          ],
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'body', type: 'textarea', localized: true },
        { name: 'cta', type: 'text', localized: true },
      ],
    },
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
