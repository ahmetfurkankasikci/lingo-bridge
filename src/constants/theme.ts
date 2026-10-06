// Design tokens for places where Tailwind classes can't be used
// (icon colors, boxShadow styles). Class names use the same palette via tailwind.config.js.

import palette from './colors';

export const colors = {
  ...palette,
  success: '#22C55E', // green-500
  danger: '#EF4444', // red-500
  text: '#111827', // gray-900
  textMuted: '#6B7280', // gray-500
  textSubtle: '#9CA3AF', // gray-400
  icon: '#374151', // gray-700
  white: '#FFFFFF',
};

export const shadows = {
  card: '0 2px 8px rgba(0, 0, 0, 0.06)',
  raised: '0 4px 12px rgba(0, 0, 0, 0.12)',
  primary: '0 4px 10px rgba(99, 102, 241, 0.3)', // primary-500
  accent: '0 4px 12px rgba(234, 88, 12, 0.35)', // accent-600
};
