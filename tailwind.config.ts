import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0D0D0D",
        "bg-secondary": "#1A1A1A",
        "bg-tertiary": "#252525",
        surface: "#1E1E1E",
        text: "#E8E8E8",
        muted: "#888888",
        ruby: "#C41E3A",
        "ruby-dark": "#8B0000",
        "ruby-light": "#E8274B",
        cyan: "#00D4FF",
        yellow: "#FFD700",
        green: "#00FF41",
        purple: "#9B59B6",
      },
      fontFamily: {
        pixel: ["var(--font-press-start)", "monospace"],
        mono: ["var(--font-vt323)", "monospace"],
      },
      boxShadow: {
        pixel: "2px 2px 0 #C41E3A",
        "pixel-cyan": "2px 2px 0 #00D4FF",
        "pixel-yellow": "2px 2px 0 #FFD700",
        "pixel-inset": "inset 2px 2px 0 #C41E3A",
        "card": "4px 4px 0 #C41E3A",
        "card-cyan": "4px 4px 0 #00D4FF",
      },
      animation: {
        blink: "blink 1s step-end infinite",
        "scanline-move": "scanline-move 8s linear infinite",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
        "glitch": "glitch 0.3s ease-in-out",
        "float": "float 3s ease-in-out infinite",
        "star-twinkle": "star-twinkle 2s ease-in-out infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "scanline-move": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 100%" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "glitch": {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(2px, -2px)" },
          "60%": { transform: "translate(-1px, 1px)" },
          "80%": { transform: "translate(1px, -1px)" },
          "100%": { transform: "translate(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "star-twinkle": {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
