// HireSkys brand theme — matches hireskys.com branding
// White background, indigo accents (light theme)

export const colors: Record<string, string> = {
  // Brand
  background: "#FFFFFF",
  surface: "#F8FAFC",
  surfaceLight: "#F1F5F9",
  border: "#E2E8F0",

  // Text
  text: "#0F172A",
  textMuted: "#64748B",
  textFaint: "#94A3B8",

  // Accents (indigo — matches hireskys.com)
  primary: "#4F46E5",
  primaryDark: "#4338CA",
  primaryLight: "#6366F1",

  // Semantic
  success: "#16A34A",
  warning: "#D97706",
  error: "#DC2626",

  // Job card
  cardBg: "#FFFFFF",
  verified: "#16A34A",
  sponsored: "#D97706",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;
