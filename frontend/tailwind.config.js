/** @type {import('tailwindcss').Config} */
const { heroui } = require("@heroui/react");

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          main: '#0a0e14',
          secondary: '#1a1f29',
        },
        text: {
          main: '#e6edf3',
          secondary: '#8b949e',
        },
        accent: {
          main: '#7c3aed',
          secondary: '#06b6d4',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        'team-red': '#dc2626',
        'team-blue': '#2563eb',
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      dark: {
        colors: {
          background: "#0a0e14",
          foreground: "#e6edf3",
          primary: {
            50: "#f5f3ff",
            100: "#ede9fe",
            200: "#ddd6fe",
            300: "#c4b5fd",
            400: "#a78bfa",
            500: "#8b5cf6",
            600: "#7c3aed",
            700: "#6d28d9",
            800: "#5b21b6",
            900: "#4c1d95",
            DEFAULT: "#7c3aed",
            foreground: "#ffffff",
          },
          secondary: {
            DEFAULT: "#06b6d4",
            foreground: "#ffffff",
          },
          success: {
            DEFAULT: "#10b981",
            foreground: "#ffffff",
          },
          warning: {
            DEFAULT: "#f59e0b",
            foreground: "#000000",
          },
          danger: {
            DEFAULT: "#ef4444",
            foreground: "#ffffff",
          },
        },
      },
    },
  })],
};
