import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      colors: {
        background: '#000000',
        surface: '#0a0a0a',
        'surface-hover': '#141414',
        border: '#262626',
        'text-primary': '#ffffff',
        'text-secondary': '#a3a3a3',
        'text-tertiary': '#737373',
        accent: '#ffffff',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['var(--font-inter-tight)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontWeight: {
        '100': '100',
        '200': '200',
        '300': '300',
        '400': '400',
        '500': '500',
        '600': '600',
        '700': '700',
        '800': '800',
        '900': '900',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}

export default config
