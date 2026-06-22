/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      spacing: {
        "4.5": "1.125rem",
      },
      colors: {
        background: "#080510",
        sidebar: "#0D0818",
        card: "#120B24",
        elevated: "#18102F",

        primary: {
          DEFAULT: "#7C3AED",
          hover: "#9333EA",
          bright: "#A855F7",
        },

        textPrimary: "#FFFFFF",
        textSecondary: "#A1A1AA",
        muted: "#71717A",

        online: "#22C55E",
        offline: "#6B7280",
        typing: "#A855F7",
        success: "#22C55E",
        error: "#EF4444",

        border: "#24193D",

        // Alternate theme palettes (selectable in Settings > Appearance)
        blueBackground: "#05070F",
        bluePrimary: "#3B82F6",
        grayBackground: "#0A0A0B",
        grayPrimary: "#6B7280",
      },
      boxShadow: {
        glow: "0 0 20px rgba(124,58,237,0.35)",
        glowSm: "0 0 10px rgba(124,58,237,0.25)",
      },
      borderRadius: {
        bubble: "20px",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
        "slide-in-right": "slideInRight 0.25s ease-out",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
