/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBlue: "#0A1F3D",
        lightBlue: "#55A7F5",
        daialogWhite: "#FFFFFF",
      },
    },
  },
  plugins: [],
};
