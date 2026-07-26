import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: "#14110F",       // tinta oscura cálida
        surface: "#1C1712",
        surface2: "#241D16",
        paper: "#F5EFE4",      // papel de ticket
        paperDim: "#EBE1CD",
        accent: "#C89B3C",     // latón envejecido
        accentSoft: "#E4C77A",
        stamp: "#A63D2F",      // tinta de sello (rojo óxido)
        warn: "#D9A441",
        danger: "#A63D2F",
        ok: "#7A8C5C",         // salvia apagada
        muted: "#9C9082",
        line: "#2B241C",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'Space Mono'", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
