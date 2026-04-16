import type { GlobalConfig } from 'payload'
import { autoTranslateGlobalHook } from '../hooks/translate'

export const Innovation: GlobalConfig = {
  slug: 'innovation',
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
      name: 'features',
      type: 'array',
      maxRows: 2,
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'text', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'stat1Value',
      type: 'text',
      label: 'Stat 1 Value (e.g. 100%)',
      defaultValue: '100%',
    },
    {
      name: 'stat1Label',
      type: 'text',
      localized: true,
      label: 'Stat 1 Label',
    },
    {
      name: 'stat2Value',
      type: 'text',
      label: 'Stat 2 Value (e.g. R&D)',
      defaultValue: 'I+D+i',
    },
    {
      name: 'stat2Label',
      type: 'text',
      localized: true,
      label: 'Stat 2 Label',
    },
    { name: 'loadingText', type: 'text', localized: true },
    { name: 'rotateText', type: 'text', localized: true },
  ],
}
