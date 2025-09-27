/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  // Add the plugins section with the new line-clamp plugin
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}