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
      label: 'Titúlo del Producto',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      label: 'Descripción Corta',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'image',
      label: 'Imagen Principal',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'features',
      label: 'Características (Opcional)',
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
