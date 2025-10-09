import type { Metadata, Viewport } from 'next'
import { Inter_Tight } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// Validate Clerk environment variables
function validateClerkConfig() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const secretKey = process.env.CLERK_SECRET_KEY
  
  if (!publishableKey || publishableKey === 'pk_test_xxxxx' || publishableKey.length < 20) {
    console.warn('⚠️ Invalid NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY detected')
    return false
  }
  
  if (!secretKey || secretKey === 'sk_test_xxxxx' || secretKey.length < 20) {
    console.warn('⚠️ Invalid CLERK_SECRET_KEY detected')
    return false
  }
  
  return true
}

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter-tight',
})

export const metadata: Metadata = {
  title: 'Winter Arc Tracker',
  description: 'A 90-day personal habit tracking application with automatic daily resets and comprehensive progress analytics',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black',
    title: 'Winter Arc',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#000000',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isValidClerkConfig = validateClerkConfig()
  
  if (!isValidClerkConfig && process.env.NODE_ENV === 'development') {
    return (
      <html lang="en" className={interTight.variable}>
        <body className="min-h-screen font-sans bg-red-50 text-red-800 p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">⚠️ Clerk Configuration Error</h1>
            <p className="mb-4">Please update your <code className="bg-red-200 px-2 py-1 rounded">.env.local</code> file with valid Clerk credentials:</p>
            <pre className="bg-red-100 p-4 rounded text-sm overflow-x-auto">
{`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_real_key
CLERK_SECRET_KEY=sk_live_your_real_key`}
            </pre>
            <p className="mt-4 text-sm">Get your keys from: <a href="https://dashboard.clerk.com" className="underline">https://dashboard.clerk.com</a></p>
          </div>
        </body>
      </html>
    )
  }
  
  // For production builds with invalid keys, render without Clerk
  if (!isValidClerkConfig) {
    return (
      <html lang="en" className={interTight.variable}>
        <body className="min-h-screen font-sans">
          <ServiceWorkerRegistration />
          <Toaster 
            position="bottom-right" 
            theme="dark"
            richColors
            closeButton
          />
          {children}
          <Analytics />
        </body>
      </html>
    )
  }

  return (
    <ClerkProvider>
      <html lang="en" className={interTight.variable}>
        <body className="min-h-screen font-sans">
          <ServiceWorkerRegistration />
          <Toaster 
            position="bottom-right" 
            theme="dark"
            richColors
            closeButton
          />
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
