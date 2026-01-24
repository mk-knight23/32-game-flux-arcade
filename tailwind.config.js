/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        arcade: {
          hub: '#0f172a',
          card: '#1e293b',
          neon: '#38bdf8',
          gold: '#fbbf24',
          danger: '#f43f5e',
          light: {
            hub: '#f8fafc',
            card: '#ffffff',
            neon: '#0284c7',
          }
        }
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
