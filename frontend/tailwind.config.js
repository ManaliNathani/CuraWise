/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f8fafc",
        ink: "#0f172a",
        muted: "#64748b",
        accent: "#2563eb",
        accentDeep: "#1d4ed8",
        accentBlue: "#10b981",
        accentBlueDeep: "#059669"
      }
    }
  },
  plugins: []
};
