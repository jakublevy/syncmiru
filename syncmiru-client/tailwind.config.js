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
        success: "#1c7f21",
        successdark: "rgb(16 185 129)",
        danger: "#dc3545",
        darkbg: "#292b2f",
        darkread: "#eeeeee"
      }
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.justify-centersafe': {
          justifyContent: 'safe center',
        },
      };
      addUtilities(newUtilities, []);
    },
  ]
}

