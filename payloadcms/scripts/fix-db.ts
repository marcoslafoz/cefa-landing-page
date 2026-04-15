import { getPayload } from 'payload'
import configPromise from './payload.config'

async function fix() {
  const payload = await getPayload({ config: configPromise })
  const certs = await payload.find({ collection: 'certificates', limit: 100 })
  for (const doc of certs.docs) {
    let newType = doc.type;
    if (doc.type === 'Medio Ambiente' || doc.type === 'environment') newType = 'environment';
    if (doc.type === 'Calidad' || doc.type === 'quality') newType = 'quality';

    if (newType !== doc.type) {
      console.log(`Fixing ${doc.id}: ${doc.type} -> ${newType}`)
      await payload.update({
        collection: 'certificates',
        id: doc.id,
        data: { type: newType }
      })
    }
  }
  process.exit(0)
}
fix()
