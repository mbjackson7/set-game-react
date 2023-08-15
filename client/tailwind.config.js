/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern: /(fill|stroke)-(red|green|purple|blue|yellow)-(300|600)/,
    },
    {
      pattern: /grid-cols-(4|5|6|7|8)/,
    },
    {
      pattern: /aspect-(2|3|4|5|6|7|8)\/4/,
    },
  ],
  theme: {
    extend: {
      strokeWidth: {
        '4': '4px',
        '8': '8px',
      },
      aspectRatio: {
        '2/3': '2/3',
        '3/4': '3/4',
        '4/3': '4/3',
        '3/2': '3/2',
        '5/7': '5/7',
        '4/4': '4/4',
        '5/4': '5/4',
        '6/4': '6/4',
        '7/4': '7/4',
        '8/4': '2/1',
      },
    },
  },
  plugins: [],
}

