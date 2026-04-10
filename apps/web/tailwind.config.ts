import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1B4332",
        secondary: "#40916C",
        accent: "#F77F00",
        background: "#0A1628",
        surface: "#1A2744",
        tucun: {
          text: "#E8F5E9",
          muted: "#9CA3AF",
          border: "#2D3748",
          danger: "#EF4444",
          success: "#10B981",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Arial", "Helvetica", "sans-serif"],
        display: ["var(--font-poppins)", "Arial", "Helvetica", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(27,67,50,0.6) 0%, rgba(10,22,40,0) 70%), linear-gradient(180deg, #0A1628 0%, #0D1E35 50%, #0A1628 100%)",
      },
      animation: {
        "bounce-slow": "bounce 3s infinite",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        accent: "0 8px 32px rgba(247, 127, 0, 0.4)",
        green: "0 0 40px rgba(64, 145, 108, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
