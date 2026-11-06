/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f2f9f5',
          100: '#dfefe6',
          200: '#c1dfd0',
          300: '#95c7b0',
          400: '#64a88b',
          500: '#418c6e',
          600: '#2f7057',
          700: '#1f5440',
          800: '#163f30',
          900: '#0f2e22',
          950: '#081b14',
        },
        cream: {
          50: '#fcfcfa',
          100: '#f7f6f2',
          200: '#efede6',
          300: '#e2dfd5',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 46, 34, 0.05), 0 2px 6px -1px rgba(15, 46, 34, 0.03)',
        'elevated': '0 12px 32px -4px rgba(15, 46, 34, 0.08), 0 4px 12px -2px rgba(15, 46, 34, 0.04)',
      }
    },
  },
  plugins: [],
};
