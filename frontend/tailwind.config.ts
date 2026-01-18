import type { Config } from 'tailwindcss';
import { heroui } from '@heroui/react';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'team-red': {
          DEFAULT: '#dc2626',
          light: '#fecaca',
          dark: '#991b1b',
        },
        'team-blue': {
          DEFAULT: '#2563eb',
          light: '#bfdbfe',
          dark: '#1e40af',
        },
        assassin: {
          DEFAULT: '#1f2937',
          light: '#374151',
        },
        neutral: {
          DEFAULT: '#d4a574',
          light: '#e5d4c0',
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [heroui() as any],
};

export default config;
