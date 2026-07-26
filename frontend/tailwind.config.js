/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ksp: {
          dark: '#0b1120',
          card: '#131c31',
          border: '#1e293b',
          accent: '#38bdf8',
          red: '#f43f5e',
          orange: '#fb923c',
          green: '#4ade80',
          purple: '#c084fc'
        }
      }
    },
  },
  plugins: [],
}
