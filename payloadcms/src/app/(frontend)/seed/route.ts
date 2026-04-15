import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })

    // Seed Certificates
    const existingCerts = await payload.find({ collection: 'certificates', limit: 1 })
    if (existingCerts.totalDocs === 0) {
      await payload.create({ collection: 'certificates', data: { type: 'Calidad', name: 'IATF 16949', issuer: 'Automotive Quality', issueDate: '2024-01-01T00:00:00.000Z' } })
      await payload.create({ collection: 'certificates', data: { type: 'Calidad', name: 'ISO 9001', issuer: 'Quality Management', issueDate: '2024-01-01T00:00:00.000Z' } })
      await payload.create({ collection: 'certificates', data: { type: 'Medio Ambiente', name: 'ISO 14001', issuer: 'Environmental', issueDate: '2024-01-01T00:00:00.000Z' } })
      await payload.create({ collection: 'certificates', data: { type: 'Calidad', name: 'TISAX', issuer: 'Security', issueDate: '2024-01-01T00:00:00.000Z' } })
    }

    // Seed RD Projects -> into 'Projects'
    const existingProjects = await payload.find({ collection: 'projects', limit: 1 })
    if (existingProjects.totalDocs === 0) {
      await payload.create({ collection: 'projects', data: { type: 'aragon', title: 'Nuevos materiales de alto rendimiento', client: 'I+D Interno', description: 'Investigación y validación de materiales plásticos de nueva generación...' } })
      await payload.create({ collection: 'projects', data: { type: 'aragon', title: 'Optimización de procesos de inyección', client: 'I+D Interno', description: 'Desarrollo de técnicas avanzadas de inyección...' } })
      await payload.create({ collection: 'projects', data: { type: 'aragon', title: 'Industria 4.0 y manufactura inteligente', client: 'I+D Interno', description: 'Implementación de sistemas de monitorización en tiempo real...' } })
    }

    // Seed Landing Content
    await payload.updateGlobal({
      slug: 'landing-content',
      data: {
        hero: {
          titleLine1: 'Ingeniería plástica',
          titleLine2: 'de alta precisión',
          subtitle: '80 años desarrollando componentes plásticos de alta performance para los OEM más exigentes del mundo.',
          ctaText: 'Nuestros productos'
        },
        mission: {
          title: 'Orientados al cliente, impulsados por la excelencia',
          description: 'CEFA es una empresa española de carácter industrial que investiga, desarrolla y produce, mayoritariamente para el sector del automóvil...'
        },
        vision: {
          title: 'Ser el referente industrial',
          description: 'Ser el socio preferido del cliente con una cartera diversificada, elevada cuota de mercado y ventas robustas.'
        },
        footer: {
          companyInfo: 'Fabricando el futuro de la movilidad. Calidad, precisión e innovación.',
          copyright: 'Todos los derechos reservados.'
        }
      }
    })

    return NextResponse.json({ message: 'Success. Seeded CEFA defaults into database!' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
