import type { CollectionConfig } from 'payload'
import { autoTranslateCollectionHook } from '../hooks/translate'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'description', 'image'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [autoTranslateCollectionHook],
  },
  fields: [
    {
      name: 'title',
      label: 'Product Title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      label: 'Short Description',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'image',
      label: 'Main Image',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'features',
      label: 'Features (Optional)',
      type: 'array',
      localized: true,
      fields: [
        {
          name: 'feature',
          type: 'text',
        },
      ],
    },
  ],
}
