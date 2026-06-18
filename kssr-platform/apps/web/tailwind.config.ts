import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { purple: "#7c3aed", blue: "#2563eb", cyan: "#06b6d4" },
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(0.7)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        pop: "pop .35s ease-out",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
