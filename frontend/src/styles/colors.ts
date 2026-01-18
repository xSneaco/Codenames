/**
 * Color Schema Configuration
 * Centralized color palette for the application
 */

export const colors = {
  // Backgrounds
  background: {
    main: '#0a0e14',      // Deep charcoal with slight blue undertone
    secondary: '#1a1f29', // Elevated surface for cards/containers
  },

  // Text
  text: {
    main: '#e6edf3',      // Crisp off-white for excellent readability
    secondary: '#8b949e', // Muted gray for less important content
  },

  // Accents
  accent: {
    main: '#7c3aed',      // Vibrant purple (works great for gaming)
    secondary: '#06b6d4', // Cyan blue (nice contrast with purple)
  },

  // Status Colors
  status: {
    success: '#10b981',   // Modern emerald green
    warning: '#f59e0b',   // Warm amber
    error: '#ef4444',     // Clear, bright red
  },
} as const;

// Type-safe color access
export type ColorSchema = typeof colors;

// Utility function to get nested color values
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let value: any = colors;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Color path "${path}" not found`);
      return '';
    }
  }

  return value;
};

export default colors;
