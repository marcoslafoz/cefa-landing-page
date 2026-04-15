'use client'
/**
 * PublishButton – Componente del admin de Payload CMS
 * ──────────────────────────────────────────────────────────────────────────
 * Proporciona una interfaz premium para disparar el build y despliegue
 * del sitio web Astro.
 */
import React, { useState } from 'react'
import { Button } from '@payloadcms/ui'

type Phase = 'idle' | 'triggering' | 'queued' | 'error'

export const PublishButton: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const handlePublish = async () => {
    setPhase('triggering')
    setMessage('Enviando señal al motor de despliegue...')

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (res.ok) {
        setPhase('queued')
        setMessage(
          data.message ??
          '¡Hecho! El servidor está regenerando la web. Los cambios serán visibles en breve (1-2 min).',
        )
      } else {
        setPhase('error')
        setMessage(`Error: ${data.error ?? 'El motor de build no respondió correctamente'}`)
      }
    } catch (err) {
      setPhase('error')
      setMessage('Error de red: No se pudo contactar con el servicio de publicación')
    }
  }

  const reset = () => {
    setPhase('idle')
    setMessage(null)
  }

  return (
    <div
      style={{
        margin: '20px 0',
        padding: '32px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1 1 400px' }}>
          <h2 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: '24px', fontWeight: '700' }}>
            Centro de Publicación
          </h2>
          <p style={{ margin: '0 0 24px 0', color: '#64748b', lineHeight: '1.6', fontSize: '15px' }}>
            Esta acción sincronizará todos los contenidos del CMS, procesará las imágenes y regenerará el sitio web estático.
            Utiliza este botón cuando quieras que tus cambios sean visibles para los usuarios finales.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              onClick={handlePublish}
              disabled={phase === 'triggering' || phase === 'queued'}
              buttonStyle="primary"
              size="large"
            >
              {phase === 'triggering' ? 'Procesando...' : 'Publicar Sitio Web'}
            </Button>
          </div>
        </div>


      </div>

      {phase === 'queued' && (
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px border #e2e8f0', fontSize: '13px', color: '#94a3b8' }}>
          <strong>Nota:</strong> El proceso de build ocurre en segundo plano. Puedes cerrar esta ventana sin interrumpir la publicación.
        </div>
      )}
    </div>
  )
}
