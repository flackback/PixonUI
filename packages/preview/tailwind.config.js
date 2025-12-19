/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'enter-spring': {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'indeterminate-progress': {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'progress-stripe': {
          'from': { backgroundPosition: '1rem 0' },
          'to': { backgroundPosition: '0 0' },
        }
      },
      animation: {
        'enter-spring': 'enter-spring 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'indeterminate-progress': 'indeterminate-progress 2s infinite ease-in-out',
        'progress-stripe': 'progress-stripe 1s linear infinite',
      }
    },
  },
  plugins: [],
}
