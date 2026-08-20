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
          blue: '#0052FF',
          blueHover: '#0043D4',
          blueDark: '#002E99',
          cyan: '#00D2FF',
          cyanLight: '#70E5FF',
          darkBg: '#080E21',
          darkSurface: '#0F1A38',
          darkCard: '#15224A',
          darkBorder: '#1E2F5E',
          accent: '#00F0FF'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace']
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-short': 'bounce 0.5s ease-in-out 2',
        'glow-red': 'glowRed 1.2s ease-in-out infinite alternate',
        'glow-blue': 'glowBlue 2s ease-in-out infinite alternate'
      },
      keyframes: {
        glowRed: {
          '0%': { boxShadow: '0 0 15px rgba(239, 68, 68, 0.4), inset 0 0 10px rgba(239, 68, 68, 0.2)' },
          '100%': { boxShadow: '0 0 35px rgba(239, 68, 68, 0.9), inset 0 0 20px rgba(239, 68, 68, 0.5)' }
        },
        glowBlue: {
          '0%': { boxShadow: '0 0 15px rgba(0, 82, 255, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 210, 255, 0.6)' }
        }
      }
    },
  },
  plugins: [],
}
