/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#F8FAFC',
          dark: '#020617'
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#0F172A'
        },
        primary: '#10B981',
        accent: '#34D399',
        textPrimary: {
          DEFAULT: '#0F172A',
          dark: '#E2E8F0'
        },
        textSecondary: {
          DEFAULT: '#64748B',
          dark: '#94A3B8'
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
