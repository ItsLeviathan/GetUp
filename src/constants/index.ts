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

export const COLORS = {
  bg: '#0A0E1A',
  bgCard: '#111827',
  bgElevated: '#1A2235',
  bgElevated2: '#212B42',
  primary: '#FF5F1F',
  primaryDim: '#FF5F1F33',
  primaryBorder: '#FF5F1F66',
  success: '#22C55E',
  successDim: '#22C55E22',
  danger: '#EF4444',
  dangerDim: '#EF444422',
  warning: '#F59E0B',
  warningDim: '#F59E0B22',
  textPrimary: '#F0F4FF',
  textSecondary: '#8B95AA',
  textMuted: '#4B5568',
  border: '#1F2D45',
  borderLight: '#2A3B55',
};

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
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

export const ALARM_SOUNDS = [
  { id: 'default', label: 'Default' },
  { id: 'beep', label: 'Beep' },
  { id: 'radar', label: 'Radar' },
];