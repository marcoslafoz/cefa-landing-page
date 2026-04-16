import type { CollectionConfig } from 'payload'
import { autoTranslateCollectionHook } from '../hooks/translate'

export const ProjectCategories: CollectionConfig = {
  slug: 'project-categories',
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
      label: 'Entity or Program Name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'logo',
      label: 'Entity Logo',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'identifier',
      label: 'Internal Identifier (e.g. eu, aragon)',
      type: 'text',
      required: true,
    },
  ],
}
