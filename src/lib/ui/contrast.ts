/** Same hex values as src/styles/tokens.css. Change both together. */
export type Palette = {
  brand: string;
  brandHover: string;
  brandSoft: string;
  accent: string;
  accentStrong: string;
  text: string;
  muted: string;
  bg: string;
  surface: string;
  border: string;
  control: string;
  danger: string;
  warning: string;
};

export const LIGHT: Palette = {
  brand: '#3730A3',
  brandHover: '#312E81',
  brandSoft: '#E0E7FF',
  accent: '#A7F3D0',
  accentStrong: '#065F46',
  text: '#111827',
  muted: '#6B7280',
  bg: '#FFFFFF',
  surface: '#F8F9FF',
  border: '#E4E7F5',
  control: '#767C9B',
  danger: '#DC2626',
  warning: '#B45309',
};

export const DARK: Palette = {
  brand: '#818CF8',
  brandHover: '#A5B4FC',
  brandSoft: '#1E1B4B',
  accent: '#34D399',
  accentStrong: '#064E3B',
  text: '#F3F4F6',
  muted: '#9CA3AF',
  bg: '#0B0D17',
  surface: '#12152A',
  border: '#262A45',
  control: '#6A6F99',
  danger: '#EF4444',
  warning: '#D97706',
};

const SRGB_THRESHOLD = 0.04045;

function channelLuminance(channel: number): number {
  const srgb = channel / 255;
  if (srgb <= SRGB_THRESHOLD) {
    return srgb / 12.92;
  }
  return ((srgb + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const match = /^#([0-9A-Fa-f]{6})$/.exec(hex);
  if (!match) throw new Error(`Expected #RRGGBB, received ${hex}`);
  const value = Number.parseInt(match[1], 16);
  const red = channelLuminance((value >> 16) & 0xff);
  const green = channelLuminance((value >> 8) & 0xff);
  const blue = channelLuminance(value & 0xff);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** WCAG 2 contrast ratio for two #RRGGBB colors. */
export function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}
