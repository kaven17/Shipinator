import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ClientProvider from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BlockShip - Decentralized Cargo Tracking',
  description: 'Secure and transparent cargo tracking system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  )
}