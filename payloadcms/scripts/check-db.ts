import { getPayload } from 'payload'
import configPromise from './payload.config'

async function check() {
  const payload = await getPayload({ config: configPromise })
  const certs = await payload.find({ collection: 'certificates' })
  console.log(JSON.stringify(certs.docs.map(d => ({ id: d.id, type: d.type })), null, 2))
  process.exit(0)
}
check()
