/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        police: {
          blue: '#002147',
          star: '#003399',
          gold: '#FFD700',
          green: '#006B3F',
          red: '#CE1126',
          light: '#F0F4F8',
          dark: '#001530',
        }
      },
    },
  },
  plugins: [],
}
