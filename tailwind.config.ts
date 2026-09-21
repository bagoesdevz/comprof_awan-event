import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          950: "#211052",
          900: "#32186B",
          800: "#452A95",
          600: "#5B3CC4",
          400: "#A855F7",
          100: "#F0EBFF",
        },
        accent: "#D66FD6",
        brandBlue: "#4A6CF7",
        surface: {
          base: "#F8F9FC",
          card: "#FFFFFF",
          muted: "#F8F9FC",
          tint: "#EEF2FF",
        },
        content: {
          title: "#211052",
          body: "#5D607D",
          muted: "#73758D",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        display: ["var(--font-jakarta)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-brand-mono)", "monospace"],
        script: ["var(--font-caveat)", "cursive"],
      },
      boxShadow: {
        diffusion: "0 12px 36px -18px rgba(91, 60, 196, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
