/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'healthcare-blue': '#3B82F6',
        'healthcare-light': '#EFF6FF',
        'healthcare-dark': '#1E40AF',
      },
    },
  },
  plugins: [],
}
