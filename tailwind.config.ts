import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
	
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          "100": "#fdfdfd",
          "200": "#fafafa",
          "300": "#111827",
          "400": "#0b1e1b",
          "500": "rgba(11, 30, 27, 0.55)",
          "600": "rgba(11, 30, 27, 0.05)",
          "700": "rgba(255, 255, 255, 0)",
        },
        black: "#000",
        darkslategray: {
          "100": "#105647",
          "200": "#14533c",
          "300": "rgba(20, 83, 60, 0.8)",
        },
        whitesmoke: {
          "100": "#f7f7f7",
          "200": "#f5f5f7",
          "300": "#f3f4f6",
          "400": "#e5eae8",
        },
        white: "#fff",
        gainsboro: "#e5e7eb",
        lightgray: "#d1d5db",
        honeydew: {
          "100": "#d1f2dc",
          "200": "rgba(209, 242, 220, 0.45)",
        },
        forestgreen: "#16a34a",
        slategray: "#6b7280",
        peru: "#d19642",
      },
      spacing: {
        "num-136_8": "136.8px",
        "num-0_8": "0.8px",
        "num-1": "0.8px solid #f3f4f6",
      },
      fontFamily: {
        "line-seed-sans-th": ["var(--font-line-seed-th)", "sans-serif"],
      },
      borderRadius: {
        "num-9999": "9999px",
      },
      padding: {
        "num-0": "0px",
      },
      fontSize: {
        "fsize-36": "36px",
        "fsize-32": "32px",
        "fsize-28": "28px",
        "fsize-24": "24px",
        "fsize-20": "20px",
        "fsize-18": "18px",
        "fsize-16": "16px",
        "fsize-14": "14px",
        "fsize-12": "12px",
      },
      lineHeight: {
        "lhigh-28": "28px",
        "lhigh-24": "24px",
        "lhigh-20": "20px",
        "lhigh-16": "16px",
      },
    },
  },
} 

export default config;;
