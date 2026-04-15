import type { CollectionConfig } from 'payload'
import { autoTranslateCollectionHook } from '../hooks/translate'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [autoTranslateCollectionHook],
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Gobierno de Aragón (FEDER)', value: 'aragon' },
        { label: 'Unión Europea', value: 'eu' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      label: 'Título del Proyecto',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'client',
      label: 'Cliente',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      label: 'Descripción / Detalles',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'image',
      label: 'Imagen Principal',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'file',
      label: 'Documento / PDF (Opcional)',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'gallery',
      label: 'Galería Múltiple (Opcional)',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}
