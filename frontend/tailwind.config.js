/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pureblack: "#000000",
        offblack: "#0D0D0D",
        primarywhite: "#FFFFFF",
        muted: "#A1A1A1",
        cyberpurple: "#7B5CFF",
        deepindigo: "#2D1B69",
        lavender: "#C4B5FD",
        peachgold: "#FDBA74",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'main': '32px',
      },
      boxShadow: {
        'cyber': '0 20px 40px rgba(0, 0, 0, 0.6)',
        'glow': '0 0 20px rgba(123, 92, 255, 0.4)',
      },
      spacing: {
        'gap': '24px',
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #7B5CFF 0%, #2D1B69 100%)',
        'card-gradient': 'linear-gradient(145deg, #7B5CFF 0%, #2D1B69 100%)',
      },
    },
  },
  plugins: [],
}
