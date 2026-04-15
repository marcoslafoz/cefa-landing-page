'use client'
/**
 * PublishButton – Componente del admin de Payload CMS
 * ──────────────────────────────────────────────────────────────────────────
 * Proporciona una interfaz minimalista y compacta que sigue estrictamente
 * el lenguaje de diseño de Payload CMS 3.0.
 */
import React, { useState } from 'react'
import { Button } from '@payloadcms/ui'

type Phase = 'idle' | 'triggering' | 'queued' | 'error'

export const PublishButton: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const handlePublish = async () => {
    setPhase('triggering')
    setMessage('Sincronizando contenidos y media...')

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
          'La solicitud de publicación ha sido enviada. El sitio se actualizará en unos minutos.',
        )
      } else {
        setPhase('error')
        setMessage(`Error: ${data.error ?? 'Error en la conexión con el motor de build'}`)
      }
    } catch (err) {
      setPhase('error')
      setMessage('Error de conexión: No se pudo contactar con el orquestador de despliegue')
    }
  }

  return (
    <div
      style={{
        margin: '1.5rem 0',
        padding: '1.5rem',
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 'var(--style-radius-m)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <h3
          style={{
            margin: 0,
            fontSize: '0.8rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--theme-elevation-400)',
          }}
        >
          Publicación
        </h3>
        <p style={{ margin: 0, color: 'var(--theme-elevation-500)', fontSize: '0.85rem' }}>
          Sincroniza los datos actuales y regenera el sitio estático.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
        <Button
          onClick={handlePublish}
          disabled={phase === 'triggering' || phase === 'queued'}
          buttonStyle="primary"
          size="small"
        >
          {phase === 'triggering'
            ? 'Procesando...'
            : phase === 'queued'
              ? 'En curso'
              : 'Publicar sitio'}
        </Button>

        {phase === 'idle' && (
          <div
            style={{
              fontSize: '0.7rem',
              color: 'var(--theme-success-500)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              opacity: 0.8,
            }}
          >
            <span
              style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }}
            />
            Listo
          </div>
        )}
      </div>

      {message && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor:
              phase === 'error'
                ? 'var(--theme-error-100)'
                : 'var(--theme-elevation-100)',
            border: `1px solid ${phase === 'error' ? 'var(--theme-error-200)' : 'var(--theme-elevation-200)'
              }`,
            borderRadius: 'var(--style-radius-s)',
            fontSize: '0.8rem',
          }}
        >
          <div
            style={{
              color:
                phase === 'error' ? 'var(--theme-error-800)' : 'var(--theme-elevation-800)',
            }}
          >
            {message}
          </div>
        </div>
      )}
    </div>
  )
}
