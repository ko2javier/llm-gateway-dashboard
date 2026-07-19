/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // page background — the deepest layer
        base: "#07090d",
        // chat panel — the protagonist, visibly elevated
        panel: "#12161e",
        // status panel — secondary, recedes toward the page background
        "panel-soft": "#0b0e13",
        // standard border
        edge: "#232c39",
        // thin, subtle border for secondary surfaces
        "edge-soft": "#161b23",
        // single vibrant accent (terminal neon green)
        accent: "#4ade80",
        "accent-dim": "#22c55e",
      },
    },
  },
  plugins: [],
};
