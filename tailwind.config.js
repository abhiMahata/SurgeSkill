/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#EEEDEB",
        foreground: "#1A1615",
        accent: {
          DEFAULT: "#00A82D",
          light: "#EAF3ED",
          blue: "#2D88FF"
        },
        primary: {
          DEFAULT: "#1A1615",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F4F1EE",
          foreground: "#1A1615",
        },
        muted: "#a1a1aa",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['Fragment Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
