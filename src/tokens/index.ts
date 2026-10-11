/**
 * DAHR Design Tokens
 * Premium bilingual quiet-luxury fragrance brand & dense admin tool system.
 */

export const tokens = {
  colors: {
    background: '#F5F1EA',
    surface: '#FAF7F2',
    textPrimary: '#1C1A17',
    textMuted: '#7A736A',
    border: '#E4DED3',
    accent: '#A98860',
    success: '#4B5D46',
    warning: '#A9772F',
    error: '#8C3B2E',
  },
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    6: '24px',
    8: '32px',
    12: '48px',
    16: '64px',
    24: '96px',
    32: '128px',
  },
  rhythm: {
    storefront: {
      sectionDesktop: '96px', // 96px - 160px
      sectionDesktopLg: '128px',
      sectionDesktopXl: '160px',
      sectionMobile: '48px', // 48px - 72px
      sectionMobileLg: '72px',
    },
    admin: {
      sectionDesktop: '32px', // 24px - 48px
      sectionMobile: '24px',
    },
  },
  grid: {
    storefront: {
      columns: 12,
      maxWidth: '1520px', // 1440px - 1600px range
      marginDesktop: '80px', // 64px - 96px
      marginMobile: '20px', // 20px - 24px
      gutterDesktop: '24px',
      gutterMobile: '16px',
    },
    admin: {
      sidebarWidth: '260px',
      collapsedSidebarWidth: '72px',
      headerHeight: '60px',
    },
    breakpoints: {
      xs: '480px',
      sm: '768px',
      md: '1024px',
      lg: '1440px',
      xl: '1600px',
    },
  },
  typography: {
    fonts: {
      latin: {
        display: "'Cormorant Garamond', Georgia, serif",
        body: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      },
      arabic: {
        display: "'Amiri', 'Noto Naskh Arabic', serif",
        body: "'IBM Plex Sans Arabic', 'Readex Pro', sans-serif",
      },
      mono: "'JetBrains Mono', monospace",
    },
    scale: {
      display: {
        desktop: { size: '96px', lineHeight: '1.05', letterSpacing: '-0.02em' },
        mobile: { size: '56px', lineHeight: '1.1', letterSpacing: '-0.01em' },
      },
      h1: {
        desktop: { size: '48px', lineHeight: '1.15', letterSpacing: '-0.01em' },
        mobile: { size: '36px', lineHeight: '1.2', letterSpacing: '0' },
      },
      h2: {
        desktop: { size: '32px', lineHeight: '1.25', letterSpacing: '0' },
        mobile: { size: '26px', lineHeight: '1.3', letterSpacing: '0' },
      },
      h3: {
        desktop: { size: '22px', lineHeight: '1.35', letterSpacing: '0' },
        mobile: { size: '20px', lineHeight: '1.4', letterSpacing: '0' },
      },
      body: {
        desktop: { size: '17px', lineHeight: '1.6', letterSpacing: '0' },
        mobile: { size: '16px', lineHeight: '1.6', letterSpacing: '0' },
      },
      caption: {
        desktop: { size: '13px', lineHeight: '1.5', letterSpacing: '0.02em' },
        mobile: { size: '12px', lineHeight: '1.5', letterSpacing: '0.02em' },
      },
      button: {
        desktop: { size: '14px', lineHeight: '1.2', letterSpacing: '0.12em', transform: 'uppercase' },
        mobile: { size: '13px', lineHeight: '1.2', letterSpacing: '0.1em', transform: 'uppercase' },
      },
    },
    arabicTune: {
      displayLineHeightMultiplier: 1.25,
      bodyLineHeightMultiplier: 1.7,
      letterSpacing: '0em', // Arabic ligatures must not be separated by artificial tracking
    },
  },
  borders: {
    hairline: '1px solid #E4DED3',
    hairlineDark: '1px solid #1C1A17',
    radius: {
      none: '0px',
      subtle: '2px',
      sm: '4px',
      pill: '9999px',
    },
  },
  shadows: {
    none: 'none', // Strictly no heavy shadows or glassmorphism
  },
  transitions: {
    default: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export type DesignTokens = typeof tokens;
