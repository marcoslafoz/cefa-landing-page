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
      name: 'file',
      label: 'Documento (Imagen o PDF)',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
  ],
}
