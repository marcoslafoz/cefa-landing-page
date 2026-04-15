'use client'
import React, { useState } from 'react'
import { Button } from '@payloadcms/ui'

export const SyncButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const handleSync = async () => {
    setLoading(true)
    setStatus('Sincronizando...')

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('Sincronización completada con éxito')
        console.log(data.stdout)
      } else {
        setStatus(`Error: ${data.error || 'Desconocido'}`)
        console.error(data.stderr)
      }
    } catch (err) {
      setStatus('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '4px' }}
    >
      <h3 style={{ marginTop: 0 }}>Sincronización con la Landing Page</h3>
      <p>
        Pulsa el botón para descargar todos los cambios actuales del CMS (textos, imágenes y
        documentos) a la carpeta del repositorio de la landing page.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Button onClick={handleSync} disabled={loading} size="medium">
          {loading ? 'Sincronizando...' : 'Sincronizar ahora'}
        </Button>

        {status && (
          <span
            style={{
              fontWeight: 'bold',
              color: status.includes('éxito')
                ? '#2ecc71'
                : status.includes('Error')
                  ? '#e74c3c'
                  : '#3498db',
            }}
          >
            {status}
          </span>
        )}
      </div>
    </div>
  )
}
