import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/container/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: "#000",
        },
        secondary: {
          100: "#f8f9fa",
          200: "#e9ecef",
          300: "#dee2e6",
          400: "#ced4da",
          500: "#adb5bd",
          600: "#6c757d",
          700: "#495057",
          800: "#343a40",
          900: "#212529",
        },
        bgNude: "#F4F2F0",
      },
      screens: {
        se: "376px",
        "-se": {
          max: "375px",
        },
        xs: "480px",
        "-xs": {
          max: "479px",
        },
        sm: "640px",
        "-sm": {
          max: "639px",
        },
        md: "800px",
        "-md": {
          max: "799px",
        },
        lg: "990px",
        "-lg": {
          max: "989px",
        },
        xl: "1024px",
        "-xl": {
          max: "1023px",
        },
        "2xl": "1280px",
        "-2xl": {
          max: "1279px",
        },
        "3xl": "1440px",
        "-3xl": {
          max: "1439px",
        },
        "4xl": "1600px",
        "-4xl": {
          max: "1599px",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        serif: ["Yeseva One", "serif"],
        sans: ["var(--font-gotham-narrow)", "Gotham Narrow", "sans-serif"],
        "yeseva-one": ["Yeseva One", "serif"],
        "gotham-narrow": ["var(--font-gotham-narrow)", "Gotham Narrow", "sans-serif"],
      },
    },
  },
  daisyui: {
    themes: ["light"],
  },
  plugins: [require("daisyui")],
};

export default config;
