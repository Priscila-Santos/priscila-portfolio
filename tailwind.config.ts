import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        neutral: {
          50: "rgb(var(--color-neutral-50) / <alpha-value>)",
          100: "rgb(var(--color-neutral-100) / <alpha-value>)",
          200: "rgb(var(--color-neutral-200) / <alpha-value>)",
          300: "rgb(var(--color-neutral-300) / <alpha-value>)",
          400: "rgb(var(--color-neutral-400) / <alpha-value>)",
          500: "rgb(var(--color-neutral-500) / <alpha-value>)",
          600: "rgb(var(--color-neutral-600) / <alpha-value>)",
          700: "rgb(var(--color-neutral-700) / <alpha-value>)",
          800: "rgb(var(--color-neutral-800) / <alpha-value>)",
          900: "rgb(var(--color-neutral-900) / <alpha-value>)"
        }
      },
      spacing: {
        "page-x": "var(--space-page-x)",
        "page-y": "var(--space-page-y)",
        section: "var(--space-section)"
      },
      fontSize: {
        body: ["var(--font-size-body)", { lineHeight: "var(--line-height-body)" }],
        nav: ["var(--font-size-nav)", { lineHeight: "var(--line-height-nav)" }],
        display: ["var(--font-size-display)", { lineHeight: "var(--line-height-display)" }]
      }
    }
  },
  plugins: []
};

export default config;
