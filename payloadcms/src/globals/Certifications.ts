import type { GlobalConfig } from 'payload'
import { autoTranslateGlobalHook } from '../hooks/translate'

export const Certifications: GlobalConfig = {
  slug: 'certifications-content',
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
      name: 'qualityCommitment',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'body', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'stats',
      type: 'group',
      fields: [
        { name: 'auditLabel', type: 'text', localized: true },
        { name: 'auditValue', type: 'text', localized: true },
        { name: 'defectLabel', type: 'text', localized: true },
        { name: 'defectValue', type: 'text', localized: true },
        { name: 'traceabilityLabel', type: 'text', localized: true },
        { name: 'traceabilityValue', type: 'text', localized: true },
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
