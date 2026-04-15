'use client'
import React from 'react'

export const Icon: React.FC = () => (
  <img
    src="/cefa-mono-white.svg"
    alt="CEFA Icon"
    style={{ width: '25px', height: 'auto', display: 'block' }}
  />
)

export const Logo: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img
      src="/cefa-mono-white.svg"
      alt="CEFA Logo"
      style={{ width: '120px', height: 'auto', display: 'block' }}
    />
  </div>
)
