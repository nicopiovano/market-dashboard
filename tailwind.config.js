/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0B1220',
        panel: '#0F1A2B',
        panel2: '#0B1526',
        border: 'rgba(255,255,255,0.08)',
        text: 'rgba(255,255,255,0.92)',
        muted: 'rgba(255,255,255,0.60)',
        accent: '#22c55e',
        danger: '#f97316',
        info: '#60a5fa',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.06), 0 12px 30px rgba(0,0,0,0.55)',
      },
    },
  },
  plugins: [],
}

