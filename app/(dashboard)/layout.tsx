'use client'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { ReactNode, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, BarChart3, TrendingUp, Calendar, User } from 'lucide-react'
import { AnimatedTabs } from '@/components/ui/AnimatedTabs'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isClerkConfigured, setIsClerkConfigured] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  // Check Clerk configuration
  useEffect(() => {
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    if (publishableKey && publishableKey !== 'pk_test_xxxxx' && publishableKey.length > 20) {
      setIsClerkConfigured(true)
    }
  }, [])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const navigationItems = [
    { href: '/today', label: 'Today', icon: Home },
    { href: '/scorecard', label: 'Scorecard', icon: BarChart3 },
    { href: '/progress', label: 'Progress', icon: TrendingUp },
    { href: '/review', label: 'Review', icon: Calendar },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className={`border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-lg shadow-black/20' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18">
            {/* Logo */}
            <Link 
              href="/today" 
              className="flex items-center space-x-2 focus:outline-none rounded-lg px-2 py-1 -mx-2 -my-1"
              aria-label="Winter Arc - Home"
            >
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary">
                Winter Arc
              </span>
            </Link>

            {/* Animated Navigation Tabs - Desktop */}
            <div className="hidden md:block">
              <AnimatedTabs 
                tabs={navigationItems} 
                activeTab={pathname}
              />
            </div>

            {/* Mobile Menu Button & User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-200 focus:outline-none"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                <div className="relative w-6 h-6">
                  <Menu 
                    className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                      isMobileMenuOpen ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'
                    }`} 
                  />
                  <X 
                    className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                      isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
                    }`} 
                  />
                </div>
              </button>

              {/* User Menu */}
              {isClerkConfigured ? (
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8 sm:w-9 sm:h-9',
                    },
                  }}
                />
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface border border-border flex items-center justify-center">
                  <User className="w-4 h-4 text-text-secondary" />
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Menu */}
      <div className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-surface border-r border-border z-50 md:hidden transform transition-transform duration-300 ease-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link 
            href="/today" 
            className="text-xl font-bold text-text-primary focus:outline-none rounded-lg px-2 py-1 -mx-2 -my-1"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Winter Arc
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors focus:outline-none"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Menu Navigation */}
        <nav className="flex-1 px-4 py-6" role="navigation" aria-label="Mobile navigation">
          <ul className="space-y-2">
            {navigationItems.map((item, index) => (
              <li key={item.href}>
                <MobileNavLink 
                  href={item.href}
                  icon={item.icon}
                  isActive={pathname === item.href}
                  animationDelay={index * 50}
                >
                  {item.label}
                </MobileNavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu Footer */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-text-tertiary text-center">
            Winter Arc • Transform in 90 days
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  )
}

function MobileNavLink({ 
  href, 
  children, 
  isActive, 
  icon: Icon,
  animationDelay 
}: { 
  href: string
  children: ReactNode
  isActive?: boolean
  icon: React.ElementType
  animationDelay?: number
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 min-h-[52px] focus:outline-none animate-in slide-in-from-left-5 ${
        isActive 
          ? 'text-text-primary bg-surface-hover border border-border shadow-sm' 
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
      }`}
      style={{ animationDelay: `${animationDelay}ms` }}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-purple-400' : ''}`} />
      <span>{children}</span>
      {isActive && (
        <div className="ml-auto w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
      )}
    </Link>
  )
}
