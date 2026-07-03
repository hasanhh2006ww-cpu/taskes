// Design Tokens — Stilldo Design System (v2)
// Single source of truth for all design decisions
// Updated: unified colors, simplified shadows, consistent spacing

export const colors = {
  // Brand
  primary: { DEFAULT: '#16A34A', light: '#22C55E', dark: '#15803D' },
  secondary: { DEFAULT: '#52525B', light: '#A1A1AA', dark: '#3F3F46' },

  // Status
  success: { DEFAULT: '#16A34A', light: '#DCFCE7', dark: '#15803D' },
  warning: { DEFAULT: '#F59E0B', light: '#FEF3C7', dark: '#D97706' },
  error: { DEFAULT: '#EF4444', light: '#FEE2E2', dark: '#DC2626' },
  info: { DEFAULT: '#3B82F6', light: '#DBEAFE', dark: '#2563EB' },

  // Surfaces
  background: { DEFAULT: '#F7F8FA', dark: '#0A0E17' },
  surface: { DEFAULT: '#FFFFFF', dark: '#18181B' },
  surfaceHover: { DEFAULT: '#F4F4F5', dark: '#27272A' },
  surfaceElevated: { DEFAULT: '#FFFFFF', dark: '#27272A' },

  // Borders
  border: { DEFAULT: '#E8E8E8', dark: '#27272A' },
  borderLight: { DEFAULT: '#F4F4F5', dark: '#18181B' },

  // Interactivity
  hover: { DEFAULT: '#F4F4F5', dark: '#27272A' },
  active: { DEFAULT: '#E4E4E7', dark: '#3F3F46' },

  // Priority
  priority: {
    low: { dot: '#16A34A', bg: '#DCFCE7', text: '#15803D' },
    medium: { dot: '#F59E0B', bg: '#FEF3C7', text: '#92400E' },
    high: { dot: '#EF4444', bg: '#FEE2E2', text: '#991B1B' },
  },

  // Project palette (10 colors)
  project: [
    '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E',
    '#F97316', '#EAB308', '#16A34A', '#14B8A6',
    '#06B6D4', '#3B82F6',
  ],
} as const;

export const typography = {
  fontFamily: {
    sans: ['var(--font-cairo)', 'system-ui', 'sans-serif'],
    mono: ['var(--font-cairo)', 'monospace'],
  },

  fontSize: {
    h1: { size: '2.25rem', lineHeight: '1.2', weight: '800' },
    h2: { size: '1.875rem', lineHeight: '1.2', weight: '700' },
    h3: { size: '1.5rem', lineHeight: '1.3', weight: '700' },
    h4: { size: '1.25rem', lineHeight: '1.3', weight: '700' },
    body: { size: '1rem', lineHeight: '1.5', weight: '400' },
    small: { size: '0.875rem', lineHeight: '1.5', weight: '500' },
    caption: { size: '0.75rem', lineHeight: '1.4', weight: '400' },
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

export const radius = {
  input: '0.75rem',
  button: '0.75rem',
  card: '1.125rem',
  dialog: '1.25rem',
} as const;

export const shadows = {
  small: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
  medium: '0 4px 12px 0 rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.08)',
  large: '0 10px 30px -8px rgb(0 0 0 / 0.15), 0 4px 12px -4px rgb(0 0 0 / 0.1)',
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
} as const;

export const grid = {
  columns: 12,
  gap: '1.5rem',
  margin: '1.5rem',
  containerMax: '80rem',
} as const;

export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
  spring: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const iconLibrary = 'lucide-react' as const;

export const designTokens = {
  colors,
  typography,
  radius,
  shadows,
  spacing,
  grid,
  transitions,
  zIndex,
  breakpoints,
  iconLibrary,
} as const;

export type DesignTokens = typeof designTokens;