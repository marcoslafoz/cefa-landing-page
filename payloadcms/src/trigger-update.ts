import { getPayload } from 'payload'
import configPromise from './payload.config'

async function run() {
  const payload = await getPayload({ config: configPromise })
  console.log('--- Triggering Hero update ---')

  try {
    const hero = await payload.findGlobal({
      slug: 'hero',
      locale: 'es',
    })

    console.log('Current Hero title:', hero.titleLine1)

    const newTitle = `Title ${new Date().getTime()}`
    console.log('Updating Hero title to:', newTitle)

    await payload.updateGlobal({
      slug: 'hero',
      locale: 'es',
      data: {
        titleLine1: newTitle,
      },
    })

    console.log('Update successful. Checking logs...')
  } catch (err) {
    console.error('Error triggering update:', err)
  }
}

run()
