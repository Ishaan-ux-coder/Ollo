/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'warm-bg-start': '#4c1d95', // Deep Violet
        'warm-bg-end': '#f97316',   // Warm Orange
        'warm-primary': '#ea580c',  // Vibrant Orange (for buttons/logo)
        'warm-secondary': '#fed7aa',// Light Peach (for secondary buttons)
        'warm-card': '#fff7ed',     // Creamy Off-White
        'warm-nav': '#18181b',      // Dark Warm Gray
        'warm-text': '#3f3f46',    // Soft Dark Gray (for text)
      },
    },
  },
  plugins: [],
};
