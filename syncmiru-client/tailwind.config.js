/** @type {import('tailwindcss').Config} */
export default {
  content: [
      './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: "rgb(99 102 241)",
        secondary: "rgb(209 213 219)",
        danger: "#dc2626"
      }
    },
  },
}

