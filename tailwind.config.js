/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Los tres colores de la bandera de Colombia, con escalas completas para
        // poder usarlos con suficiente contraste.
        //
        //   brand (azul #003893) → acciones principales, navegación, enlaces
        //   gold  (amarillo #FCD116) → identidad, hallazgos y ayuda disponible
        //   rojo  (#CE1126) → urgencia: desapariciones, emergencias y errores
        //
        // El amarillo puro no tiene contraste suficiente sobre blanco, así que
        // siempre se usa como fondo con texto oscuro o como franja decorativa.
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#b8d0ff',
          300: '#8ab1ff',
          400: '#5488fb',
          500: '#2f65f0',
          600: '#1a48d6',
          700: '#0f35ac',
          800: '#003893',
          900: '#04246b',
        },
        gold: {
          50: '#fffbea',
          100: '#fff4c4',
          200: '#ffe886',
          300: '#fcd116',
          400: '#eab000',
          500: '#c98a00',
          600: '#a26a02',
          700: '#815108',
          800: '#6b410e',
          900: '#583512',
        },
        rojo: {
          50: '#fef2f3',
          100: '#fde3e5',
          200: '#fbccd1',
          300: '#f7a3ac',
          400: '#f06b7b',
          500: '#e33e53',
          600: '#ce1126',
          700: '#ab0f21',
          800: '#8e1121',
          900: '#7a1220',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px -12px rgba(4, 36, 107, 0.14)',
      },
      backgroundImage: {
        // Franja de la bandera: amarillo (mitad), azul y rojo (un cuarto cada uno).
        bandera:
          'linear-gradient(to right, #fcd116 0%, #fcd116 50%, #003893 50%, #003893 75%, #ce1126 75%, #ce1126 100%)',
      },
    },
  },
  plugins: [],
};
