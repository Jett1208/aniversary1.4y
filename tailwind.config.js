/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        handwritten: ['"Charm"', 'cursive'],
        sans: ['"Kanit"', 'sans-serif'],
      },
      colors: {
        paper: {
          light: '#FBF9F5',
          cream: '#F4EFE6',
          craft: '#E6D7C3',
          dark: '#3D342B',
        },
        scrapbook: {
          border: '#E8DED1',
          tape: 'rgba(255, 235, 179, 0.7)',
        },
      },
      boxShadow: {
        paper: '0 4px 20px -2px rgba(60, 40, 20, 0.15), 0 2px 6px -1px rgba(60, 40, 20, 0.1)',
        polaroid: '0 8px 30px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};
