/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './components/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './services/**/*.{js,ts,jsx,tsx}',
    './utils/**/*.{js,ts,jsx,tsx}',
    './*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'muted': '#f3f4f6',
        'muted-foreground': '#6b7280',
      },
    },
  },
  plugins: [],
}
