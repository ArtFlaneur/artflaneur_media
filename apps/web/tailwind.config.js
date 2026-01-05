/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        art: {
          black: '#1a1a1a',
          paper: '#F9F7F5',
          red: '#D93025',
          blue: '#2539e9',
          yellow: '#FFD700',
          gray: '#E5E5E5',
        }
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}
