import type { CollectionConfig } from 'payload'
import { autoTranslateCollectionHook } from '../hooks/translate'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'client'],
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
      relationTo: 'project-categories' as any,
      required: true,
      label: 'Project Category',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      label: 'Project Title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'client',
      label: 'Client',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      label: 'Description / Details',
      type: 'textarea',
      required: true,
      localized: true,
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
