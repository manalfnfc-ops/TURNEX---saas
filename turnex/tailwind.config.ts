import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: "#07050D",        // negro con fondo violeta
        surface: "#120B22",
        surface2: "#1A1030",
        accent: "#A855F7",      // morado eléctrico
        accentSoft: "#C084FC",
        accent2: "#6D28D9",
        cyan: "#22D3EE",
        warn: "#F0B429",
        danger: "#F43F5E",
        ok: "#34D399",
        muted: "#9C94B8",
        line: "#241A3D",
      },
      fontFamily: {
        display: ["'Outfit'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'Space Mono'", "monospace"],
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(168,85,247,0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
