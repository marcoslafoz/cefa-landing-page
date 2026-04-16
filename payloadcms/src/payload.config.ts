import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { ProjectCategories } from './collections/ProjectCategories'
import { Certificates } from './collections/Certificates'
import { CertificateCategories } from './collections/CertificateCategories'
import { Header } from './globals/Header'
import { Hero } from './globals/Hero'
import { Mission } from './globals/Mission'
import { Vision } from './globals/Vision'
import { Innovation } from './globals/Innovation'
import { Contact } from './globals/Contact'
import { Awards } from './globals/Awards'
import { Certifications } from './globals/Certifications'
import { ResearchDevelopment } from './globals/ResearchDevelopment'
import { History } from './globals/History'
import { Careers } from './globals/Careers'
import { FAQ } from './globals/FAQ'
import { SEO } from './globals/SEO'
import { Quote } from './globals/Quote'
import { ProductsSection } from './globals/ProductsSection'
import { Clients } from './globals/Clients'


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '- CEFA Admin',
    },
    components: {
      beforeDashboard: ['@/components/PublishButton#PublishButton'],
      graphics: {
        Icon: '@/components/Graphics#Icon',
        Logo: '@/components/Graphics#Logo',
      },
    },
  },
  onInit: async (payload) => {
    if (process.env.PAYLOAD_SEED === 'true') {
      payload.logger.info('PAYLOAD_SEED detected. Running seed...')
      try {
        const { seed } = await import('./seed')
        await seed(payload)
        payload.logger.info('Seed completed.')
      } catch (err) {
        payload.logger.error({ err }, 'Error during seed')
      }
    }
  },
  collections: [Users, Media, ProjectCategories, Projects, CertificateCategories, Certificates],
  globals: [
    Header,
    Hero,
    Mission,
    Vision,
    Innovation,
    ProductsSection,
    Quote,
    Clients,
    Contact,
    Awards,
    Certifications,
    ResearchDevelopment,
    History,
    Careers,
    FAQ,
    SEO,
  ],
  editor: lexicalEditor(),
  localization: {
    locales: ['es', 'en', 'de', 'pl'],
    defaultLocale: 'es',
    fallback: true,
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [],
})
