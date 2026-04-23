/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:      '#154efa',  // azul royal — botões e ações
        secondary:    '#14dffa',  // ciano elétrico — hover, links, acentos
        tertiary:     '#07074b',  // azul marinho — base da interface
        'bg-light':   '#f5f7fd',  // branco atenuado
        'bg-dark':    '#07074b',  // azul marinho escuro
        'safie-light':'#f5f7fd',
        'safie-dark': '#07074b',
      },
      fontFamily: {
        heading: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        body:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        cta:     ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontWeight: {
        display: '800',
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
