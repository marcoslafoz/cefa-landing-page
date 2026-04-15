import React from 'react'
import './styles.css'

export const metadata = {
  description: 'CEFA - Soluciones avanzadas para el sector automotriz.',
  title: 'CEFA',
  icons: {
    icon: '/icon.svg',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
