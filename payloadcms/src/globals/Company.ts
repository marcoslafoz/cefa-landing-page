import type { GlobalConfig } from 'payload'
import { autoTranslateGlobalHook } from '../hooks/translate'

export const Company: GlobalConfig = {
  slug: 'company',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [autoTranslateGlobalHook],
  },
  fields: [
    {
      name: 'mission',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', localized: true },
        { name: 'title', type: 'text', localized: true },
        { name: 'body1', type: 'textarea', localized: true },
        { name: 'body2', type: 'textarea', localized: true },
        { name: 'cta', type: 'text', localized: true },
        { name: 'badgeLabel', type: 'text', localized: true },
      ],
    },
    {
      name: 'pillars',
      type: 'array',
      maxRows: 3,
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'text', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'vision',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', localized: true },
        { name: 'title', type: 'text', localized: true },
        { name: 'body', type: 'text', localized: true },
        { name: 'cta', type: 'text', localized: true },
        {
          name: 'values',
          type: 'array',
          maxRows: 4,
          fields: [
            { name: 'title', type: 'text', localized: true },
            { name: 'text', type: 'textarea', localized: true },
          ],
        },
      ],
    },
  ],
}
