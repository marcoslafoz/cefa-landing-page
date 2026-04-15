import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'


import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })


  return (
    <div className="home">
      <div className="content">
        <picture>
          <Image
            alt="CEFA Logo"
            height={120}
            src="/cefa-mono-white.svg"
            width={100}
            style={{ width: '100px', height: 'auto' }}
          />
        </picture>
        {!user && <h1>Administrador web de CEFA.</h1>}
        {user && <h1>Bienvenido, {user.email}</h1>}
        <div className="links">
          <a
            className="admin"
            href={payloadConfig.routes.admin}
            rel="noopener noreferrer"
            target="_blank"
          >
            Ir al panel de administración
          </a>
        </div>
      </div>

    </div>
  )
}
