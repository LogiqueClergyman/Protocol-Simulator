/**
 * Theme Design Tokens
 * Centralized design system for the Protocol Simulator dashboard
 *
 * Inspired by clean financial dashboard aesthetics:
 * - Teal/green accent colors
 * - Professional, trustworthy feel
 * - Subtle shadows and spacing
 */

// Chart color palette - cohesive teal/green family
export const chartColors = {
    primary: '#1BD488',      // Retro Lime - main accent
    secondary: '#45828B',    // Wish Upon a Star - secondary
    tertiary: '#055B65',     // Enamelled Jewel - dark accent
    quaternary: '#E0E5E9',   // City Lights - muted
    success: '#10B981',      // Green for positive
    warning: '#F59E0B',      // Amber for warnings
    danger: '#EF4444',       // Red for negative/critical
    muted: '#94A3B8',        // Slate gray
} as const;

// Semantic chart colors for specific data types
export const dataColors = {
    validators: chartColors.primary,
    stake: chartColors.secondary,
    nc33: chartColors.success,
    nc50: chartColors.warning,
    distribution: [
        chartColors.primary,
        chartColors.secondary,
        chartColors.tertiary,
        '#2DD4BF', // Teal
        '#06B6D4', // Cyan
        '#0EA5E9', // Sky
    ],
} as const;

// Spacing scale (in pixels, use with Tailwind arbitrary values)
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
} as const;

// Border radius
export const radius = {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
} as const;

// Shadow presets
export const shadows = {
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    cardHover: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
} as const;

// Typography
export const typography = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
    },
} as const;
