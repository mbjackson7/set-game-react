/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern: /(fill|stroke)-(red|green|purple)-(300|600)/,
    }
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

