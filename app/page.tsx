import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const { userId } = await auth()
  
  if (userId) {
    redirect('/today')
  } else {
    redirect('/sign-in')
  }
}
