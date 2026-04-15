import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'

/**
 * POST /api/publish
 * ──────────────────────────────────────────────────────────────────────────
 * Recibe la señal del botón "Publicar" y ejecuta localmente el build
 * de Astro. Como Payload tiene montado el código de `cefa-landing-page`,
 * puede hacer el build y realizar el atomic swap para Nginx directamente.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const payload = await getPayload({ config: configPromise })

  const authHeader = req.headers.get('authorization') ?? ''
  const cookieHeader = req.headers.get('cookie') ?? ''

  let authenticated = false
  try {
    const { user } = await payload.auth({ headers: req.headers })
    authenticated = !!user
  } catch {
    authenticated = false
  }

  if (!authenticated) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const astroDir = process.env.ASTRO_BASE_DIR || path.resolve(process.cwd(), '../landing-page')
  const webrootDir = process.env.WEBROOT_DIR ?? '/webroot'
  const lockFile = path.join(astroDir, '.build.lock')

  if (fs.existsSync(lockFile)) {
    return NextResponse.json({ error: 'Ya hay un build en progreso' }, { status: 409 })
  }

  // Marcar lock
  fs.writeFileSync(lockFile, 'locked')

  // Ejecutar el build de forma asíncrona ("fire and forget") para no bloquear al cliente
  setTimeout(() => {
    try {
      console.log('--- STARTING ASTRO BUILD ---')

      // Asegurarse de tener dependencias (por si acaso)
      // luego sync-cms, luego astro build
      // Por último, atomic swap

      const buildCmd = `
        cd "${astroDir}" && \
        npm install && \
        PAYLOAD_CMS_URL=http://localhost:3000 node scripts/sync-cms.js && \
        npm run build
      `

      exec(buildCmd, (error, stdout, stderr) => {
        if (error) {
          console.error('Build Error:', error)
          console.error(stderr)
        } else {
          console.log('Build Output:', stdout)

          // Atomic Swap
          const buildOutDir = path.join(astroDir, 'dist')
          const stagingDir = path.join(webrootDir, '.staging')
          const liveDir = path.join(webrootDir, 'live')
          const oldLiveDir = path.join(webrootDir, 'live.old')

          try {
            if (fs.existsSync(stagingDir)) fs.rmSync(stagingDir, { recursive: true, force: true })

            const buildOutClientDir = path.join(astroDir, 'dist/client')
            fs.mkdirSync(stagingDir, { recursive: true })
            fs.cpSync(buildOutClientDir, stagingDir, { recursive: true })

            // Permisos para Nginx
            try { exec(`chmod -R a+rX "${stagingDir}"`) } catch (e) { }

            if (fs.existsSync(oldLiveDir)) fs.rmSync(oldLiveDir, { recursive: true, force: true })
            if (fs.existsSync(liveDir)) fs.renameSync(liveDir, oldLiveDir)
            fs.renameSync(stagingDir, liveDir)
            if (fs.existsSync(oldLiveDir)) fs.rmSync(oldLiveDir, { recursive: true, force: true })

            console.log('✅ Atomic swap complete. Web is live.')
          } catch (swapErr) {
            console.error('Swap Error:', swapErr)
          }
        }

        // Finalizar lock
        if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile)
      })

    } catch (err) {
      console.error('Fatal crash inside background build:', err)
      if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile)
    }
  }, 100)

  return NextResponse.json(
    { queued: true, message: '✅ Build en cola. Payload regenerará la web y la servirá Nginx.' },
    { status: 202 },
  )
}
