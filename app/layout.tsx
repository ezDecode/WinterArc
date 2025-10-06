import type { Metadata, Viewport } from 'next'
import { Inter_Tight } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter-tight',
})

export const metadata: Metadata = {
  title: 'Winter Arc Tracker',
  description: 'A 90-day personal habit tracking application with automatic daily resets and comprehensive progress analytics',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={interTight.variable}>
        <body className="min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}

