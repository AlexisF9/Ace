export const colors = {
  orange: "#C4501A",
  orangeLight: "#F5DDD5",
  orangeMid: "#E8987A",
  orangeDark: "#8C3610",
ink: "#0C0C0C",
  inkSecondary: "#3A3A3A",
  inkTertiary: "#8A8A8A",
  inkBorder: "#D0D0D0",
  white: "#FFFFFF",
  surface: "#F7F7F7",
  error: "#D92B2B",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  pill: 9999,
} as const;

export const typography = {
  display: {
    fontSize: 42,
    fontFamily: "Outfit_800ExtraBold",
    letterSpacing: -0.02 * 42,
  },
  h1: { fontSize: 26, fontFamily: "Outfit_700Bold", letterSpacing: -0.01 * 26 },
  h2: { fontSize: 18, fontFamily: "Outfit_700Bold" },
  body: { fontSize: 14, fontFamily: "Outfit_400Regular", lineHeight: 22 },
  bodyMedium: { fontSize: 14, fontFamily: "Outfit_500Medium", lineHeight: 22 },
  caption: { fontSize: 12, fontFamily: "Outfit_500Medium" },
  overline: {
    fontSize: 10,
    fontFamily: "Outfit_600SemiBold",
    letterSpacing: 0.14 * 10,
    textTransform: "uppercase" as const,
  },
  badge: {
    fontSize: 11,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 0.06 * 11,
  },
  price: { fontSize: 18, fontFamily: "Outfit_800ExtraBold" },
  scoreNumber: {
    fontSize: 40,
    fontFamily: "Outfit_800ExtraBold",
    letterSpacing: -0.02 * 40,
  },
} as const;
