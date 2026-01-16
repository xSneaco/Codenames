/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'team-red': '#dc2626',
        'team-blue': '#2563eb',
        'team-neutral': '#a3a3a3',
        'team-black': '#000000',
      },
    },
  },
  plugins: [],
};
