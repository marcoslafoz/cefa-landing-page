import type { GlobalConfig } from 'payload'
import { autoTranslateGlobalHook } from '../hooks/translate'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [autoTranslateGlobalHook],
  },
  fields: [
    {
      name: 'logos',
      type: 'group',
      fields: [
        { name: 'cefaColor', type: 'upload', relationTo: 'media', label: 'Logo CEFA Color' },
        { name: 'cefaWhite', type: 'upload', relationTo: 'media', label: 'CEFA White Logo' },
        { name: 'motherson', type: 'upload', relationTo: 'media', label: 'Logo Motherson' },
      ],
    },
    {
      name: 'header',
      type: 'group',
      fields: [
        { name: 'company', type: 'text', localized: true },
        { name: 'products', type: 'text', localized: true },
        { name: 'clients', type: 'text', localized: true },
        { name: 'contact', type: 'text', localized: true },
        { name: 'contactCta', type: 'text', localized: true },
      ],
    },
    {
      name: 'links',
      label: 'Navigation Link Labels',
      type: 'group',
      fields: [
        { name: 'mission', type: 'text', localized: true },
        { name: 'vision', type: 'text', localized: true },
        { name: 'innovation', type: 'text', localized: true },
        { name: 'history', type: 'text', localized: true },
        { name: 'awards', type: 'text', localized: true },
        { name: 'certifications', type: 'text', localized: true },
        { name: 'rd', type: 'text', localized: true },
        { name: 'presence', type: 'text', localized: true },
        { name: 'careers', type: 'text', localized: true },
        { name: 'faq', type: 'text', localized: true },
        { name: 'clients', type: 'text', localized: true },
        { name: 'contact', type: 'text', localized: true },
        { name: 'dashboard', type: 'text', localized: true },
        { name: 'door', type: 'text', localized: true },
        { name: 'functional', type: 'text', localized: true },
        { name: 'exterior', type: 'text', localized: true },
      ],
    },
    {
      name: 'ui',
      label: 'UI Labels',
      type: 'group',
      fields: [
        { name: 'menuOpen', type: 'text', localized: true, label: 'Open Menu (accessibility)' },
        { name: 'language', type: 'text', localized: true, label: 'Language Selector Label' },
        { name: 'plantsLabel', type: 'text', localized: true, label: 'Industrial Plants Label (footer)' },
      ],
    },
    {
      name: 'footerColumns',
      type: 'group',
      fields: [
        { name: 'company', type: 'text', localized: true },
        { name: 'products', type: 'text', localized: true },
        { name: 'contact', type: 'text', localized: true },
      ],
    },
    {
      name: 'footer',
      label: 'Footer Texts',
      type: 'group',
      fields: [
        { name: 'tagline', type: 'textarea', localized: true },
        { name: 'linkedin', type: 'text', localized: true, label: 'LinkedIn CTA Text' },
        { name: 'motherson', type: 'text', localized: true, label: 'Motherson Group Label' },
        { name: 'legal', type: 'text', localized: true, label: 'Legal Notice Link' },
        { name: 'privacy', type: 'text', localized: true, label: 'Privacy Link' },
        { name: 'cookies', type: 'text', localized: true, label: 'Cookies Link' },
        { name: 'rights', type: 'text', localized: true, label: 'All Rights Reserved Text' },
      ],
    },
  ],
}
