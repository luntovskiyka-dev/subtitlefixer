// tailwind.config: theme.extend
module.exports = {
  colors: {
    brand: { DEFAULT: 'var(--sf-brand)', hover: 'var(--sf-brand-hover)', soft: 'var(--sf-brand-soft)' },
    accent: { DEFAULT: 'var(--sf-accent)', strong: 'var(--sf-accent-strong)' },
    ink: 'var(--sf-text)', muted: 'var(--sf-muted)',
    bg: 'var(--sf-bg)', surface: 'var(--sf-surface)', line: 'var(--sf-border)',
    danger: 'var(--sf-danger)', warning: 'var(--sf-warning)',
  },
  borderRadius: { sf: 'var(--sf-radius)' },
  fontFamily: { sans: 'var(--sf-font)', mono: 'var(--sf-mono)' },
};
