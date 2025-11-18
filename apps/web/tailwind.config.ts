import type {Config} from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        xl: "4rem",
      },
    },
    screens: {
      sm: "600px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
    },
    extend: {
      colors: {
        brand: {
          rust: "#B6411D",
          "rust-dark": "#8D2F12",
          sand: "#F4EEE3",
          cobalt: "#283DF6",
          flame: "#FF3B1F",
          amber: "#FF8904",
          charcoal: "#2F2F2F",
          graphite: "#3F3F3F",
          bone: "#FFF8F1",
        },
        surface: {
          base: "#F4EEE3",
          card: "#FFFFFF",
          overlay: "#101010",
        },
        border: {
          soft: "#E6DFD6",
          strong: "#BFB7AE",
        },
        text: {
          primary: "#2F2F2F",
          muted: "#5F5A54",
          inverse: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-archivo)", "Archivo", "system-ui", "sans-serif"],
        heading: ["var(--font-archivo)", "Archivo", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xs: "0.35rem",
        sm: "0.65rem",
        md: "1rem",
        lg: "1.5rem",
        pill: "999px",
      },
      boxShadow: {
        card: "0 25px 60px -35px rgba(23, 24, 30, 0.35)",
        "card-soft": "0 20px 35px -30px rgba(0, 0, 0, 0.45)",
      },
      spacing: {
        13: "3.25rem",
        18: "4.5rem",
        22: "5.5rem",
      },
      maxWidth: {
        prose: "72ch",
      },
    },
  },
  plugins: [],
};

export default config;
