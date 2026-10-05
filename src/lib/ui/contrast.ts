/** Same hex values as src/styles/tokens.css. Change both together. */
export type Palette = {
  bg: string;
  surface: string;
  subtle: string;
  text: string;
  muted: string;
  brand: string;
  brandHover: string;
  lilac: string;
  onBrand: string;
  onBrandMuted: string;
  accent: string;
  onAccent: string;
  accentSoft: string;
  accentWash: string;
  accentInk: string;
  teal: string;
  tealSoft: string;
  tealInk: string;
  mint: string;
  success: string;
  line: string;
  edge: string;
  control: string;
  danger: string;
  warning: string;
  shadowColor: string;
  dropzone: string;
  footer: string;
  footerText: string;
  footerMuted: string;
  footerMint: string;
  navActive: string;
  onNav: string;
  stageLine: string;
  tShift: string;
  tShiftBg: string;
  cShift: string;
  tDrift: string;
  tDriftBg: string;
  cDrift: string;
  tEnc: string;
  tEncBg: string;
  cEnc: string;
  tS2v: string;
  tS2vBg: string;
  cS2v: string;
  tV2s: string;
  tV2sBg: string;
  cV2s: string;
  tAss: string;
  tAssBg: string;
  cAss: string;
  tS2t: string;
  tS2tBg: string;
  cS2t: string;
  tT2s: string;
  tT2sBg: string;
  cT2s: string;
  tMerge: string;
  tMergeBg: string;
  cMerge: string;
};

export const LIGHT: Palette = {
  bg: '#FFF8EF',
  surface: '#FFFFFF',
  subtle: '#FBF1E4',
  text: '#1B1A3A',
  muted: '#5E5A7A',
  brand: '#5B4BFF',
  brandHover: '#4B3BE6',
  lilac: '#E6E1FF',
  onBrand: '#FFFFFF',
  onBrandMuted: '#F4F2FF',
  accent: '#FF7A59',
  onAccent: '#1B1A3A',
  accentSoft: '#FFD4C7',
  accentWash: '#FFEDE6',
  accentInk: '#B93A12',
  teal: '#2EC4B6',
  tealSoft: '#D5F5F1',
  tealInk: '#0F766E',
  mint: '#B8F2DC',
  success: '#065F46',
  line: '#EADFCF',
  edge: '#1B1A3A',
  control: '#1B1A3A',
  danger: '#C81E1E',
  warning: '#B45309',
  shadowColor: '#1B1A3A',
  dropzone: '#4B3BE6',
  footer: '#1B1A3A',
  footerText: '#FFF8EF',
  footerMuted: '#C9C5E3',
  footerMint: '#B8F2DC',
  navActive: '#1B1A3A',
  onNav: '#FFFFFF',
  stageLine: '#1B1A3A',
  tShift: '#FFFFFF',
  tShiftBg: '#5B4BFF',
  cShift: '#E6E1FF',
  tDrift: '#1B1A3A',
  tDriftBg: '#2EC4B6',
  cDrift: '#D5F5F1',
  tEnc: '#1B1A3A',
  tEncBg: '#6EE7B7',
  cEnc: '#D9F8EA',
  tS2v: '#1B1A3A',
  tS2vBg: '#FF7A59',
  cS2v: '#FFE3D9',
  tV2s: '#1B1A3A',
  tV2sBg: '#FF8FC0',
  cV2s: '#FFE0EE',
  tAss: '#1B1A3A',
  tAssBg: '#7CC8FF',
  cAss: '#DDF0FF',
  tS2t: '#1B1A3A',
  tS2tBg: '#FFC94D',
  cS2t: '#FFF1C9',
  tT2s: '#1B1A3A',
  tT2sBg: '#B5E655',
  cT2s: '#EDF8D3',
  tMerge: '#1B1A3A',
  tMergeBg: '#C9A2FF',
  cMerge: '#F1E6FF',
};

export const DARK: Palette = {
  bg: '#15142B',
  surface: '#1F1D3F',
  subtle: '#28264D',
  text: '#FFF8EF',
  muted: '#B9B5D6',
  brand: '#4B3BE6',
  brandHover: '#A79EFF',
  lilac: '#2B2760',
  onBrand: '#FFFFFF',
  onBrandMuted: '#F4F2FF',
  accent: '#FF8A6B',
  onAccent: '#15142B',
  accentSoft: '#5A2C24',
  accentWash: '#4A2230',
  accentInk: '#FF9C80',
  teal: '#3DD6C8',
  tealSoft: '#123C3A',
  tealInk: '#5EEAD4',
  mint: '#123C3A',
  success: '#6EE7B7',
  line: '#34315C',
  edge: '#8E88C8',
  control: '#8E88C8',
  danger: '#F87171',
  warning: '#FBBF24',
  shadowColor: '#07061A',
  dropzone: '#3B2FC9',
  footer: '#0E0D20',
  footerText: '#FFF8EF',
  footerMuted: '#C9C5E3',
  footerMint: '#B8F2DC',
  navActive: '#FFF8EF',
  onNav: '#1B1A3A',
  stageLine: '#FFFFFF',
  tShift: '#FFFFFF',
  tShiftBg: '#5B4BFF',
  cShift: '#2B2760',
  tDrift: '#1B1A3A',
  tDriftBg: '#2EC4B6',
  cDrift: '#123C3A',
  tEnc: '#1B1A3A',
  tEncBg: '#6EE7B7',
  cEnc: '#1A3D24',
  tS2v: '#1B1A3A',
  tS2vBg: '#FF7A59',
  cS2v: '#4A2A22',
  tV2s: '#1B1A3A',
  tV2sBg: '#FF8FC0',
  cV2s: '#48213C',
  tAss: '#1B1A3A',
  tAssBg: '#7CC8FF',
  cAss: '#15334D',
  tS2t: '#1B1A3A',
  tS2tBg: '#FFC94D',
  cS2t: '#3D3415',
  tT2s: '#1B1A3A',
  tT2sBg: '#B5E655',
  cT2s: '#2B3A12',
  tMerge: '#1B1A3A',
  tMergeBg: '#C9A2FF',
  cMerge: '#33204D',
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
