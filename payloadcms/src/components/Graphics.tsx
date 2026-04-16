'use client'
import React from 'react'
import { useTheme } from '@payloadcms/ui'
import Link from 'next/link'

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

export const SidebarLogo: React.FC = () => {
  const { theme } = useTheme()
  return (
    <div
      style={{
        padding: '2rem 1.1rem 2rem 1.1rem',
        display: 'flex',
        justifyContent: 'flex-start',
        width: '100%',
      }}
    >
      <Link
        href="/admin"
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '100%',
          textDecoration: 'none',
        }}
      >
        <img
          src="/cefa-mono-white.svg"
          alt="CEFA Logo"
          className="sidebar-logo-img"
          style={{
            width: '100%',
            maxWidth: '40px',
            height: 'auto',
            filter: theme === 'light' ? 'invert(1)' : 'none',
            transition: 'all 0.2s ease-in-out',
            cursor: 'pointer',
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
        />
      </Link>
    </div>
  )
}
