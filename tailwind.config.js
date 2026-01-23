/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        game: {
          bg: '#0f172a',
          card: '#1e293b',
          accent: '#38bdf8',
          gold: '#fbbf24',
          danger: '#f43f5e',
          success: '#10b981'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        game: ['"Press Start 2P"', 'cursive']
      },
    },
  },
  plugins: [],
}
