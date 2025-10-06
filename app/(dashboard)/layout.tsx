import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/today" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-text-primary">
                Winter Arc
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink href="/today">Today</NavLink>
              <NavLink href="/scorecard">Scorecard</NavLink>
              <NavLink href="/progress">Progress</NavLink>
              <NavLink href="/review">Review</NavLink>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9',
                  },
                }}
              />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-1 pb-3 overflow-x-auto">
            <NavLink href="/today">Today</NavLink>
            <NavLink href="/scorecard">Scorecard</NavLink>
            <NavLink href="/progress">Progress</NavLink>
            <NavLink href="/review">Review</NavLink>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
    >
      {children}
    </Link>
  )
}
