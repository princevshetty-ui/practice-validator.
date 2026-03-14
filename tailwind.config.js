/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#121212",
      },
      boxShadow: {
        glow: "0 0 0 4px rgba(34,211,238,0.15), 0 0 36px rgba(34,211,238,0.28)",
      },
    },
  },
  plugins: [],
};
