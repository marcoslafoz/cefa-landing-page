'use client'
/**
 * PublishButton – Componente del admin de Payload CMS
 * ──────────────────────────────────────────────────────────────────────────
 * Proporciona una interfaz minimalista y moderna que sigue estrictamente
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
        margin: '2rem 0',
        padding: '2rem',
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 'var(--style-radius-m, 4px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h3 style={{
          margin: 0,
          fontSize: '1rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--theme-elevation-800)'
        }}>
          Publicación
        </h3>
        <p style={{ margin: 0, color: 'var(--theme-elevation-400)', fontSize: '0.9rem' }}>
          Sincroniza los datos actuales y regenera el sitio estático para producción.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button
          onClick={handlePublish}
          disabled={phase === 'triggering' || phase === 'queued'}
          buttonStyle="primary"
          size="small"
        >
          {phase === 'triggering' ? 'Procesando...' : phase === 'queued' ? 'Publicación en curso' : 'Publicar sitio'}
        </Button>

        {phase === 'idle' && (
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--theme-success-500, #2ecc71)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
            Listo
          </div>
        )}
      </div>

      {message && (
        <div style={{
          padding: '1rem',
          backgroundColor: phase === 'error' ? 'var(--theme-error-100, rgba(255, 0, 0, 0.05))' : 'var(--theme-elevation-100)',
          border: `1px solid ${phase === 'error' ? 'var(--theme-error-200, #ff0000)' : 'var(--theme-elevation-200)'}`,
          borderRadius: 'var(--style-radius-s, 2px)',
          fontSize: '0.85rem'
        }}>
          <div style={{ color: phase === 'error' ? 'var(--theme-error-800, #ff0000)' : 'var(--theme-elevation-800)' }}>
            {message}
          </div>
        </div>
      )}
    </div>
  )
}
