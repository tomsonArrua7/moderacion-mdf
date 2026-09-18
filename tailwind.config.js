/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mdf: {
          blue: '#74ACDF', // Celeste Argentino
          blueHover: '#5A94C7',
          blueDark: '#0B1B3D', // Azul Marino
          cyan: '#FFB81C', // Dorado Sol de Mayo (reemplaza al cyan fluo)
          cyanLight: '#FFD166',
          darkBg: '#0B1B3D', // Fondo principal Azul Marino
          darkSurface: '#12264F', // Paneles un poco más claros
          darkCard: '#183063', // Tarjetas
          darkBorder: '#2B4A85', // Bordes sutiles
          accent: '#FFB81C' // Acento dorado
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace']
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-short': 'bounce 0.5s ease-in-out 2'
      }
    },
  },
  plugins: [],
}
