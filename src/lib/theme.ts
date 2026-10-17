// HireSkys brand theme — matches hireskys.com branding
// Dark navy #0B0F19 background, indigo accents

export const colors: Record<string, string> = {
  // Brand
  background: "#0B0F19",
  surface: "#131A2A",
  surfaceLight: "#1B2440",
  border: "#2A3352",

  // Text
  text: "#F1F5F9",
  textMuted: "#94A3B8",
  textFaint: "#64748B",

  // Accents (indigo — matches web links)
  primary: "#6366F1",
  primaryDark: "#4F46E5",
  primaryLight: "#818CF8",

  // Semantic
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",

  // Job card
  cardBg: "#151D33",
  verified: "#22C55E",
  sponsored: "#F59E0B",
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
