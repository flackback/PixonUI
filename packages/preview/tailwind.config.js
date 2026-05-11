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
      colors: {
        background: 'rgb(var(--color-background, 255 255 255) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground, 9 9 11) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--color-primary, 59 130 246) / <alpha-value>)',
          foreground: 'rgb(var(--color-primary-foreground, 255 255 255) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--color-muted, 244 244 245) / <alpha-value>)',
          foreground: 'rgb(var(--color-muted-foreground, 113 113 122) / <alpha-value>)',
        },
      },
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
        },
        'shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'gradient': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        }
      },
      animation: {
        'enter-spring': 'enter-spring 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'indeterminate-progress': 'indeterminate-progress 2s infinite ease-in-out',
        'progress-stripe': 'progress-stripe 1s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient': 'gradient 8s ease infinite',
      }
    },
  },
  plugins: [],
}
