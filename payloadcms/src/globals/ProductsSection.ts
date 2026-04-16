import type { GlobalConfig } from 'payload'
import { autoTranslateGlobalHook } from '../hooks/translate'

export const ProductsSection: GlobalConfig = {
  slug: 'products-section',
  label: 'Products',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [autoTranslateGlobalHook],
  },
  fields: [
    {
      name: 'sectionHeader',
      type: 'group',
      label: 'Section Header',
      fields: [
        { name: 'eyebrow', type: 'text', localized: true, label: 'Eyebrow' },
        { name: 'title', type: 'text', localized: true, label: 'Title' },
        { name: 'subtitle', type: 'textarea', localized: true, label: 'Subtitle' },
        { name: 'cta', type: 'text', localized: true, label: 'Call to Action (CTA)' },
      ],
    },
    {
      name: 'products',
      type: 'array',
      label: 'Products',
      maxRows: 8,
      fields: [
        { name: 'title', type: 'text', localized: true, required: true, label: 'Product Name' },
        { name: 'description', type: 'textarea', localized: true, label: 'Short Description' },
        { name: 'category', type: 'text', label: 'Category (e.g. Interior, Exterior, Functional)' },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Product Image',
        },
        {
          name: 'features',
          type: 'array',
          label: 'Features (optional)',
          fields: [
            { name: 'feature', type: 'text', localized: true },
          ],
        },
      ],
    },
  ],
}
