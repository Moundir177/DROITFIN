/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2AA084", // Updated teal green
        secondary: "#111111", // Near black
        accent: "#2AA084", // Updated accent green to match
        light: "#F5FFF8", // Light green-tinted white
        dark: "#050505", // Deep black
        orange: {
          DEFAULT: "#FF8A00", // Primary orange
          light: "#FFAC4B", // Light orange
          dark: "#E67300", // Dark orange
          50: "#FFF8EB",
          100: "#FFE0B2",
          200: "#FFCC80",
          300: "#FFB74D",
          400: "#FFA726",
          500: "#FF8A00",
          600: "#FB8C00",
          700: "#F57C00",
          800: "#EF6C00",
          900: "#E65100",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        poppins: ["var(--font-poppins)"],
      },
      backgroundImage: {
        'green-gradient': 'linear-gradient(135deg, #2AA084 0%, #2AA084 100%)',
        'dark-gradient': 'linear-gradient(135deg, #111111 0%, #333333 100%)',
        'orange-gradient': 'linear-gradient(135deg, #FF8A00 0%, #FFAC4B 100%)',
        'green-orange-gradient': 'linear-gradient(135deg, #2AA084 0%, #FF8A00 100%)',
      },
      boxShadow: {
        'green': '0 4px 14px 0 rgba(42, 160, 132, 0.39)',
        'black': '0 4px 14px 0 rgba(0, 0, 0, 0.25)',
        'orange': '0 4px 14px 0 rgba(255, 138, 0, 0.39)',
      },
    },
  },
  plugins: [],
}; 