/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#154efa',
        secondary: '#2414fa',
        'bg-light': '#f5f7fd',
        'bg-dark': '#0f0f29',
        // Aliases descritivos usados nos componentes
        'safie-light': '#f5f7fd',
        'safie-dark': '#0f0f29',
      },
      fontFamily: {
        heading: ['Esphimere', 'Playfair Display', 'serif'],
        body: ['Telegraf', 'Inter', 'sans-serif'],
        cta: ['Inter', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}
