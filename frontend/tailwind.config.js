/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkbg: '#0B0F17',
        darksecondary: '#111827',
        darkcard: '#1A1F2E',
        darkborder: '#23283B',
        darktext: '#F3F4F6',
        darkmuted: '#9CA3AF',
        accent: {
          start: '#7C5CFF',
          mid: '#8B5CF6',
          end: '#A855F7',
          glow: '#6D28D9',
        },
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      borderRadius: {
        DEFAULT: '0.75rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px rgba(124, 92, 255, 0.35)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
