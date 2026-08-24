export const BATHROOM_ITEMS = [
  { id: 'toothbrush', label: 'Toothbrush', emoji: '🪥', keywords: ['toothbrush', 'brush'] },
  { id: 'toothpaste', label: 'Toothpaste', emoji: '🦷', keywords: ['toothpaste', 'paste', 'tube'] },
  { id: 'soap', label: 'Soap', emoji: '🧼', keywords: ['soap', 'bar soap', 'hand soap'] },
  { id: 'shampoo', label: 'Shampoo', emoji: '🧴', keywords: ['shampoo', 'bottle', 'hair'] },
  { id: 'conditioner', label: 'Conditioner', emoji: '🧴', keywords: ['conditioner', 'bottle'] },
  { id: 'faucet', label: 'Faucet', emoji: '🚿', keywords: ['faucet', 'tap', 'sink', 'water'] },
  { id: 'showerhead', label: 'Shower Head', emoji: '🚿', keywords: ['shower', 'showerhead'] },
  { id: 'lotion', label: 'Lotion', emoji: '🧴', keywords: ['lotion', 'moisturizer', 'cream'] },
  { id: 'mirror', label: 'Mirror', emoji: '🪞', keywords: ['mirror', 'reflection'] },
  { id: 'towel', label: 'Towel', emoji: '🛁', keywords: ['towel', 'cloth'] },
] as const;

export type BathroomItemId = typeof BATHROOM_ITEMS[number]['id'];

// ── Bold / Energetic palette ────────────────────────────────────────────────
// A functional duotone, not decoration: VOLT marks "go" states (CTAs, active
// toggles, streaks, target locks). CORAL marks "urgent/retry" states (the
// live alarm banner, failed attempts). Each color means something specific,
// so it never reads as one generic neon-on-black accent.
export const COLORS = {
  bg: '#050505',
  bgCard: '#141416',
  bgElevated: '#1C1C1F',
  bgElevated2: '#28282C',

  primary: '#D7FF3D', // volt — CTAs, active states, target-lock, streaks
  primaryDim: 'rgba(215, 255, 61, 0.16)',
  primaryBorder: 'rgba(215, 255, 61, 0.55)',
  onPrimary: '#0A0A0A', // text/icons placed on top of bright volt or green fills

  secondary: '#FF3D5C', // hot coral — urgency: live alarm, retry, miss
  secondaryDim: 'rgba(255, 61, 92, 0.16)',
  secondaryBorder: 'rgba(255, 61, 92, 0.5)',

  success: '#1FE38A',
  successDim: 'rgba(31, 227, 138, 0.16)',

  danger: '#FF3D5C',
  dangerDim: 'rgba(255, 61, 92, 0.16)',

  warning: '#FFC53D',
  warningDim: 'rgba(255, 197, 61, 0.16)',

  textPrimary: '#FFFFFF',
  textSecondary: '#ABABB3',
  textMuted: '#6E6E76',

  border: '#232326',
  borderLight: '#35353A',
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const TOUCH_TARGET = {
  ios: 44,
  android: 48,
  min: 44,
};

// Reusable neon glow — spend it sparingly, on hero CTAs and live states only.
export const GLOW = {
  primary: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
  secondary: {
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
};

export const ALARM_SOUNDS = [
  { id: 'default', label: 'Default' },
  { id: 'beep', label: 'Beep' },
  { id: 'radar', label: 'Radar' },
];