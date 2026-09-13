export const colors = {
  // Primary - Blue (Trust, Reliability)
  primary: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
  },
  // Secondary - Orange (Energy, Urgency for emergencies)
  secondary: {
    50: "#FFF7ED",
    100: "#FFEDD5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#F97316",
    600: "#EA580C",
    700: "#C2410C",
    800: "#9A3412",
    900: "#7C2D12",
  },
  // Success - Green
  success: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    500: "#22C55E",
    600: "#16A34A",
    700: "#15803D",
  },
  // Warning - Yellow
  warning: {
    50: "#FEFCE8",
    100: "#FEF9C3",
    500: "#EAB308",
    600: "#CA8A04",
    700: "#A16207",
  },
  // Error - Red
  error: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C",
  },
  // Neutrals
  neutral: {
    50: "#FAFAFA",
    100: "#F4F4F5",
    200: "#E4E4E7",
    300: "#D4D4D8",
    400: "#A1A1AA",
    500: "#71717A",
    600: "#52525B",
    700: "#3F3F46",
    800: "#27272A",
    900: "#18181B",
  },
  white: "#FFFFFF",
  black: "#000000",
  // Additional semantic colors
  text: "#18181B",
  textSecondary: "#71717A",
  surface: "#FAFAFA",
  border: "#E4E4E7",
  background: "#FFFFFF",
  // Aliases for common usage
  info: {
    50:  "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
  },
  accent: "#EA580C",   // secondary[600]
  primaryLight: "#DBEAFE", // primary[100]
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const fontWeight = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
};

export const shadows = {
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  // Additional shadow sizes
  small: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
};

export const typography = {
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: 20,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  heading: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
  },
  // Additional typography styles
  h1: {
    fontSize: fontSize["4xl"],
    fontWeight: fontWeight.bold,
    lineHeight: 40,
  },
  h2: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    lineHeight: 36,
  },
  h3: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    lineHeight: 28,
  },
  bodyBold: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: 20,
  },
};
