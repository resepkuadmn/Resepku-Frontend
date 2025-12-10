/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'resepku-orange': '#e6a357',
        'resepku-dark': '#333333', 
        'resepku-brown': '#3a2e1c',
        'resepku-red': '#e74c3c',
        'resepku-blue': '#007bff',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        lucida: ['"Lucida Handwriting"', 'cursive'],
      }
    },
  },
  plugins: [],
}