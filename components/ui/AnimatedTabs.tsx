'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Tab {
  href: string
  label: string
  icon?: React.ElementType
}

interface AnimatedTabsProps {
  tabs: Tab[]
  activeTab: string
  className?: string
}

export function AnimatedTabs({ tabs, activeTab, className = '' }: AnimatedTabsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoverStyle, setHoverStyle] = useState({})
  const [activeStyle, setActiveStyle] = useState({ left: '0px', width: '0px' })
  const tabRefs = useRef<(HTMLDivElement | null)[]>([])

  // Find active tab index
  useEffect(() => {
    const index = tabs.findIndex(tab => tab.href === activeTab)
    if (index !== -1) {
      setActiveIndex(index)
    }
  }, [activeTab, tabs])

  // Update hover style
  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = tabRefs.current[hoveredIndex]
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        })
      }
    }
  }, [hoveredIndex])

  // Update active indicator style
  useEffect(() => {
    const activeElement = tabRefs.current[activeIndex]
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement
      setActiveStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      })
    }
  }, [activeIndex])

  // Initialize active style on mount
  useEffect(() => {
    requestAnimationFrame(() => {
      const index = tabs.findIndex(tab => tab.href === activeTab)
      const element = tabRefs.current[index !== -1 ? index : 0]
      if (element) {
        const { offsetLeft, offsetWidth } = element
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        })
      }
    })
  }, [tabs, activeTab])

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      const activeElement = tabRefs.current[activeIndex]
      if (activeElement) {
        const { offsetLeft, offsetWidth } = activeElement
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        })
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeIndex])

  return (
    <div className={`relative ${className}`}>
      {/* Hover Highlight */}
      <div
        className="absolute h-[36px] transition-all duration-300 ease-out bg-surface-hover/50 rounded-lg pointer-events-none"
        style={{
          ...hoverStyle,
          top: '0px',
          opacity: hoveredIndex !== null && hoveredIndex !== activeIndex ? 1 : 0,
        }}
      />

      {/* Active Indicator - Bottom Line */}
      <div
        className="absolute bottom-0 h-[2px] bg-purple-400 transition-all duration-300 ease-out rounded-full"
        style={activeStyle}
      />

      {/* Tabs */}
      <div className="relative flex space-x-1 items-center">
        {tabs.map((tab, index) => {
          const Icon = tab.icon
          const isActive = index === activeIndex
          
          return (
            <div
              key={tab.href}
              ref={(el) => {
                tabRefs.current[index] = el
              }}
              className="relative"
            >
              <Link
                href={tab.href}
                className={`
                  px-3 sm:px-4 py-2 cursor-pointer transition-colors duration-200 
                  h-[36px] rounded-lg flex items-center gap-2 whitespace-nowrap
                  focus:outline-none focus:ring-2 focus:ring-purple-500 
                  focus:ring-offset-2 focus:ring-offset-black
                  ${isActive 
                    ? 'text-text-primary' 
                    : 'text-text-secondary hover:text-text-primary'
                  }
                `}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                aria-current={isActive ? 'page' : undefined}
              >
                {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                <span className="text-sm font-medium">{tab.label}</span>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
