import { withOpacityValue } from 'tailwindcss/lib/util/withOpacityValue';

export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        foreground: withOpacityValue('--foreground'),
        background: withOpacityValue('--background'),
        muted: {
          DEFAULT: withOpacityValue('--muted'),
          foreground: withOpacityValue('--muted-foreground'),
        },
        border: withOpacityValue('--border'),
        input: withOpacityValue('--input'),
        ring: withOpacityValue('--ring'),
      },
    },
  },
  plugins: [],
};