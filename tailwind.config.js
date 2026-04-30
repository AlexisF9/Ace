/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        orange: "#C4501A",
        "orange-light": "#F5DDD5",
        "orange-mid": "#E8987A",
        "orange-dark": "#8C3610",
ink: "#0C0C0C",
        "ink-secondary": "#3A3A3A",
        "ink-tertiary": "#8A8A8A",
        "ink-border": "#D0D0D0",
        surface: "#F7F7F7",
        error: "#D92B2B",
      },
      fontFamily: {
        display: ["Outfit_700Bold"],
        "display-bold": ["Outfit_800ExtraBold"],
        "display-semi": ["Outfit_600SemiBold"],
        body: ["Outfit_400Regular"],
        "body-medium": ["Outfit_500Medium"],
      },
      borderRadius: {
        xs: "6px",
        sm: "10px",
        md: "14px",
        lg: "20px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
};
