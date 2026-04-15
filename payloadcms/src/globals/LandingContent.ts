import type { GlobalConfig } from 'payload'
import { autoTranslateGlobalHook } from '../hooks/translate'

export const LandingContent: GlobalConfig = {
  slug: 'landing-content',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [autoTranslateGlobalHook],
  },
  fields: [
    {
      name: 'hero',
      label: 'Sección Hero',
      type: 'group',
      fields: [
        { name: 'titleLine1', label: 'Título (Parte Blanca)', type: 'text', localized: true },
        { name: 'titleLine2', label: 'Título (Parte Roja Pequeña)', type: 'text', localized: true },
        { name: 'subtitle', type: 'text', localized: true },
        { name: 'ctaText', type: 'text', localized: true },
      ],
    },
    {
      name: 'mission',
      label: 'Sección Misión',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'vision',
      label: 'Sección Visión',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'footer',
      label: 'Pie de Página (Footer)',
      type: 'group',
      fields: [
        { name: 'companyInfo', type: 'textarea', localized: true },
        { name: 'copyright', type: 'text', localized: true },
      ],
    },
  ],
}
