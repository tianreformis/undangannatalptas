/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#eef5f0',
          100: '#d6e7dc',
          200: '#aacdb7',
          300: '#7bb092',
          400: '#4e8f6f',
          500: '#316b4d',
          600: '#26583f',
          700: '#1c4633',
          800: '#153526',
          900: '#10291f',
          950: '#081a12',
        },
        burgundy: {
          50: '#fbeff0',
          100: '#f4d6d9',
          200: '#e6a8ad',
          300: '#d17980',
          400: '#b34c56',
          500: '#a33241',
          600: '#872331',
          700: '#6d1a25',
          800: '#55141d',
          900: '#3d0f16',
          950: '#2a090f',
        },
        gold: {
          50: '#fdf8ea',
          100: '#f9eec6',
          200: '#f0dfa8',
          300: '#e6c972',
          400: '#d9b64a',
          500: '#c9a227',
          600: '#a9861d',
          700: '#866818',
          800: '#634d15',
          900: '#42330f',
        },
        cream: {
          50: '#fdfbf6',
          100: '#f8f3e8',
          200: '#efe6d3',
          300: '#e2d5bd',
          400: '#cdbb9c',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.22em',
      },
      boxShadow: {
        soft: '0 18px 45px -20px rgba(16, 41, 31, 0.35)',
        gold: '0 12px 30px -12px rgba(201, 162, 39, 0.55)',
      },
      keyframes: {
        'star-twinkle': {
          '0%, 100%': { opacity: '0.25', transform: 'scale(0.85)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        'garland-sway': {
          '0%, 100%': { transform: 'rotate(-1.5deg)' },
          '50%': { transform: 'rotate(1.5deg)' },
        },
        'star-glow': {
          '0%, 100%': {
            opacity: '0.86',
            transform: 'scale(0.97)',
            filter: 'drop-shadow(0 0 5px rgba(230, 201, 114, 0.35))',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.03)',
            filter: 'drop-shadow(0 0 16px rgba(230, 201, 114, 0.75))',
          },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(26px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(201, 162, 39, 0.45)' },
          '70%': { boxShadow: '0 0 0 16px rgba(201, 162, 39, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(201, 162, 39, 0)' },
        },
      },
      animation: {
        'star-twinkle': 'star-twinkle 3.6s ease-in-out infinite',
        'garland-sway': 'garland-sway 7s ease-in-out infinite',
        'star-glow': 'star-glow 5s ease-in-out infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'fade-up': 'fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-ring': 'pulse-ring 2.8s ease-out infinite',
      },
    },
  },
  plugins: [],
}
