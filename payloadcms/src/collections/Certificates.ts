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
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Calidad', value: 'Calidad' },
        { label: 'Medio Ambiente', value: 'Medio Ambiente' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'name',
      label: 'Nombre del Certificado',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'issuer',
      label: 'Emisor (ej: ISO)',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'issueDate',
      label: 'Fecha de Emisión',
      type: 'text',
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
