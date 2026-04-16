import { PayloadHandler } from 'payload'
import { exec } from 'child_process'
import path from 'path'

export const syncHandler: PayloadHandler = async (req) => {
  if (req.user === null) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const scriptPath = path.resolve(process.cwd(), '../landing-page/scripts/sync-cms.js')
    const env = {
      ...process.env,
      PAYLOAD_CMS_URL: process.env.INTERNAL_CMS_URL || 'http://localhost:3000'
    }

    return new Promise((resolve) => {
      exec(`node ${scriptPath}`, { env, cwd: path.dirname(scriptPath) }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Manual sync error: ${error.message}`)
          resolve(new Response(JSON.stringify({ error: error.message, stderr }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }))
          return
        }

        resolve(new Response(JSON.stringify({ message: 'Sync completed successfully', stdout }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }))
      })
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
