/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563eb",
          dark: "#1e40af",
          light: "#3b82f6",
        },
        accent: {
          green: "#16a34a",
          red: "#dc2626",
          yellow: "#ca8a04",
        },
      },
      boxShadow: {
        card: "0 4px 20px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
