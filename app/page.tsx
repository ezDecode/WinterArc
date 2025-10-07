import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { LandingPage } from '@/components/landing/LandingPage'

export default async function HomePage() {
  const { userId } = await auth()
  
  // If user is authenticated, redirect to dashboard
  if (userId) {
    redirect('/today')
  }
  
  // Otherwise, show landing page
  return <LandingPage />
}
