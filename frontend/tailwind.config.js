export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          50: "#e9edf4",
          300: "#a3aec4",
          400: "#7c88a3",
          600: "#2a3858",
          700: "#1e2a45",
          800: "#151f36",
          900: "#0d1527",
        },
        canvas: "rgb(var(--cv-canvas) / <alpha-value>)",
        surface: "rgb(var(--cv-surface) / <alpha-value>)",
        line: "rgb(var(--cv-line) / <alpha-value>)",
        fg: "rgb(var(--cv-fg) / <alpha-value>)",
        muted: "rgb(var(--cv-muted) / <alpha-value>)",
        subtle: "rgb(var(--cv-subtle) / <alpha-value>)",
        analytics: {
          DEFAULT: "#2456d6",
          strong: "#1a43ad",
          soft: "rgb(var(--cv-analytics-soft) / <alpha-value>)",
        },
        alert: {
          DEFAULT: "#c2410c",
          soft: "rgb(var(--cv-alert-soft) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "#b42318",
          soft: "rgb(var(--cv-danger-soft) / <alpha-value>)",
        },
        caution: {
          DEFAULT: "#a15c07",
          soft: "rgb(var(--cv-caution-soft) / <alpha-value>)",
        },
        positive: {
          DEFAULT: "#15803d",
          soft: "rgb(var(--cv-positive-soft) / <alpha-value>)",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.05)",
        pop: "0 12px 32px -12px rgba(15,23,42,0.28)",
      },
    },
  },
};
