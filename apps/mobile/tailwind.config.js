/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1B4332",
        secondary: "#40916C",
        accent: "#F77F00",
        background: "#0A1628",
        surface: "#1A2744",
        border: "#2D3748",
        danger: "#EF4444",
        success: "#10B981",
        tucun: {
          text: "#E8F5E9",
          muted: "#9CA3AF",
        },
      },
    },
  },
  plugins: [],
};
