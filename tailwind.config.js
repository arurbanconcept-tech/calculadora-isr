/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1C3A2E',
          light: '#2A5242',
          dark: '#0F2018',
        },
        accent: {
          DEFAULT: '#C8A96E',
          light: '#D4BB8E',
          dark: '#A88A4E',
        },
        danger: '#B03A2E',
        success: '#2E7D32',
        surface: '#FFFFFF',
        bg: '#F5F0EB',
        border: '#E0D8CF',
        muted: '#6B6B6B',
        text: '#1A1A1A',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 20px rgba(28, 58, 46, 0.08)',
        elevated: '0 8px 40px rgba(28, 58, 46, 0.15)',
      },
      borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '24px',
      },
    },
  },
  plugins: [],
};
