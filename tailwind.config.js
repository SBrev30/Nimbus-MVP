/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable dark mode via class
  theme: {
    extend: {
      colors: {
        accent: '#A5F7AC',
        sidebar: '#EAE9E9',
        background: '#F9FAFB',
        'page-bg': 'rgb(246, 246, 241)', // Your new page background color
        'true-white': '#ffffff', // For areas that should stay pure white (inputs, modals, etc.)
        // Override white to use your custom color for pages
        white: 'rgb(246, 246, 241)',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
        'noto-sans': ['Noto Sans', 'sans-serif'],
        'pt-serif': ['PT Serif', 'serif'],
        'libre-baskerville': ['Libre Baskerville', 'serif'],
        merriweather: ['Merriweather', 'serif'],
        baskervville: ['Baskervville', 'serif'],
      },
      width: {
        '58': '14.5rem', // 232px
        '74': '18.5rem', // 296px
      },
      spacing: {
        '58': '14.5rem',
        '74': '18.5rem',
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: 'Inter, sans-serif',
            maxWidth: 'none',
          },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
