/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crypto: {
          dark: '#0a0a0b',
          card: '#18181b', // zinc-900
          accent: '#10b981', // emerald-500
          danger: '#ef4444', // red-500
          text: '#e4e4e7', // zinc-200
          muted: '#71717a', // zinc-500
          border: '#27272a', // zinc-800
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
