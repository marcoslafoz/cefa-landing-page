import type { CollectionConfig } from 'payload'
import { autoTranslateCollectionHook } from '../hooks/translate'

export const Certificates: CollectionConfig = {
  slug: 'certificates',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'issuer', 'issueDate'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [autoTranslateCollectionHook],
  },
  fields: [
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'certificate-categories' as any,
      required: true,
      label: 'Certification Type',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'name',
      label: 'Certificate Name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'issuer',
      label: 'Issuer (e.g. ISO)',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'issueDate',
      label: 'Issue Date',
      type: 'text',
    },
    {
      name: 'file',
      label: 'Document (Image or PDF)',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
  ],
}
