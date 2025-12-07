// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  // 🎯 Add the 'class' strategy for next-themes to toggle the theme
  darkMode: ['class'],
  
  content: [
    // This array tells Tailwind which files to scan for classes.
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Recommended if you use a 'src' directory
  ],
  theme: {
    extend: {
      // You can add your custom colors, fonts, etc., here later.
    },
  },
  plugins: [
    // Include plugins needed by your components (e.g., Shadcn/ui often needs this)
    require("tailwindcss-animate"), 
  ],
}