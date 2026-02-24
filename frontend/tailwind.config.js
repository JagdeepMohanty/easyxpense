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
          dark: '#0B1220'
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#111827'
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#1F2937'
        },
        primary: '#10B981',
        accent: '#10B981',
        textPrimary: {
          DEFAULT: '#0F172A',
          dark: '#E5E7EB'
        },
        textSecondary: {
          DEFAULT: '#64748B',
          dark: '#9CA3AF'
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
