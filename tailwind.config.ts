import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3498db',
        secondary: '#8e44ad',
        accent: '#2980b9',
        text: {
          DEFAULT: '#333333',
          dark: '#f1f5f9'
        }
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '50%': { transform: 'translate(5%, 5%) rotate(5deg)' },
        },
        'drift-reverse': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '50%': { transform: 'translate(-5%, -5%) rotate(-5deg)' },
        },
      },
      animation: {
        drift: 'drift 30s ease-in-out infinite',
        'drift-reverse': 'drift-reverse 40s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
