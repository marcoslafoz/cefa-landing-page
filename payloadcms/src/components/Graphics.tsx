'use client'
import React from 'react'
import { useTheme } from '@payloadcms/ui'

export const Icon: React.FC = () => {
  const { theme } = useTheme()
  return (
    <img
      src="/cefa-mono-white.svg"
      alt="CEFA Icon"
      style={{
        width: '25px',
        height: 'auto',
        display: 'block',
        filter: theme === 'light' ? 'invert(1)' : 'none',
        transition: 'filter 0.2s ease',
      }}
    />
  )
}

export const Logo: React.FC = () => {
  const { theme } = useTheme()
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img
        src="/cefa-mono-white.svg"
        alt="CEFA Logo"
        style={{
          width: '120px',
          height: 'auto',
          display: 'block',
          filter: theme === 'light' ? 'invert(1)' : 'none',
          transition: 'filter 0.2s ease',
        }}
      />
    </div>
  )
}
