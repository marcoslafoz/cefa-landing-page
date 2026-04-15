import { PayloadHandler } from 'payload'
import { exec } from 'child_process'
import path from 'path'

export const syncHandler: PayloadHandler = async (req) => {
  if (req.user === null) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // La ruta relativa al script dentro del contenedor (ahora que montamos el repo padre)
    // El contenedor está en /home/node/repo/payloadcms
    // El script está en /home/node/repo/landing-page/scripts/sync-cms.js
    const scriptPath = path.resolve(process.cwd(), '../landing-page/scripts/sync-cms.js')

    console.log(`Iniciando sincronización manual desde el admin...`)

    // Ejecutamos el script usando node directamente
    // Pasamos la URL del CMS como variable de entorno por si acaso
    const env = {
      ...process.env,
      PAYLOAD_CMS_URL: process.env.INTERNAL_CMS_URL || 'http://localhost:3000'
    }

    return new Promise((resolve) => {
      exec(`node ${scriptPath}`, { env, cwd: path.dirname(scriptPath) }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error en sync manual: ${error.message}`)
          resolve(new Response(JSON.stringify({ error: error.message, stderr }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }))
          return
        }

        console.log(`Sync manual completado: ${stdout}`)
        resolve(new Response(JSON.stringify({ message: 'Sincronización completada con éxito', stdout }), {
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
