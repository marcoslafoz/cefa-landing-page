import type { CollectionConfig } from 'payload'
import { autoTranslateCollectionHook } from '../hooks/translate'

export const CertificateCategories: CollectionConfig = {
  slug: 'certificate-categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [autoTranslateCollectionHook],
  },
  fields: [
    {
      name: 'name',
      label: 'Certification Type',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'identifier',
      label: 'Internal Identifier (e.g. quality, environment)',
      type: 'text',
      required: true,
    },
  ],
}
