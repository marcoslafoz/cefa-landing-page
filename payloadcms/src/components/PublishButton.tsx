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
          '¡Solicitud enviada! La web se está generando. Estará lista en 1-2 minutos.',
        )
      } else {
        setPhase('error')
        setMessage(`Error: ${data.error ?? 'Fallo en la comunicación con el motor de build'}`)
      }
    } catch (err) {
      setPhase('error')
      setMessage('Error crítico: No se puede contactar con el orquestador de despliegue')
    }
  }

  const getStatusStyles = () => {
    switch (phase) {
      case 'triggering': return { bg: '#eff6ff', border: '#3b82f6', color: '#1d4ed8', icon: '🔄' }
      case 'queued': return { bg: '#f0fdf4', border: '#22c55e', color: '#15803d', icon: '✅' }
      case 'error': return { bg: '#fef2f2', border: '#ef4444', color: '#b91c1c', icon: '❌' }
      default: return null
    }
  }

  const status = getStatusStyles()

  return (
    <div
      style={{
        margin: '24px 0',
        padding: '40px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Gradient Bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #1e293b 0%, #ce121f 100%)'
      }} />

      <div style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px'
          }}>
            🚀
          </div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '26px', fontWeight: '800', letterSpacing: '-0.02em' }}>
            Centro de Publicación
          </h2>
        </div>

        <p style={{ margin: '0 0 32px 0', color: '#64748b', lineHeight: '1.7', fontSize: '16px', fontWeight: '450' }}>
          Esta acción sincroniza los datos del CMS, procesa las imágenes y regenera el sitio estático.
          Úsalo para aplicar los cambios finales a la web de producción.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{
            padding: '14px 32px',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '600',
            transition: 'all 0.2s',
            cursor: (phase === 'triggering' || phase === 'queued') ? 'not-allowed' : 'pointer'
          }}>
            <Button
              onClick={handlePublish}
              disabled={phase === 'triggering' || phase === 'queued'}
              buttonStyle="primary"
              size="large"
            >
              {phase === 'triggering' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>🔄</span>
                  Procesando...
                </span>
              ) : phase === 'queued' ? 'Publicación Iniciada' : 'Publicar Sitio Web'}
            </Button>
          </div>

          {phase === 'idle' && (
            <span style={{ fontSize: '14px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
              Listo para publicar
            </span>
          )}
        </div>

        {status && (
          <div style={{
            marginTop: '32px',
            padding: '20px',
            backgroundColor: status.bg,
            border: `1px solid ${status.border}`,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            animation: 'fadeIn 0.4s ease-out'
          }}>
            <span style={{ fontSize: '20px' }}>{status.icon}</span>
            <div style={{ color: status.color, fontSize: '15px', fontWeight: '500' }}>
              {message}
            </div>
          </div>
        )}

        {phase === 'queued' && (
          <div style={{
            marginTop: '24px',
            padding: '16px 0',
            borderTop: '1px solid #f1f5f9',
            fontSize: '14px',
            color: '#64748b',
            fontStyle: 'italic'
          }}>
            <strong>💡 Tip:</strong> El proceso de build ocurre en segundo plano. Puedes continuar trabajando en otras secciones sin esperar.
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  )
}
