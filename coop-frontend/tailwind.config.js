/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: '#004B33',
        emerald: '#0A7A54',
        champagne: '#C5A384',
        bronze: '#8E6D52',
        polished: '#111111',
        offwhite: '#F2F0ED',
      },
    },
  },
  plugins: [],
}