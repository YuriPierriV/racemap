/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2f27ce',
        secondary: '#dddbff',
        background: '#fbfbfe',
        text: '#040316',
        accent: '#443dff',
        'dark-primary': '#3a31d8',
        'dark-secondary': '#020024',
        'dark-background': '#010104',
        'dark-text': '#eae9fc',
        'dark-accent': '#0600c2',
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'], // Adiciona a fonte Roboto
      },
    },
  },
  plugins: [],
}
