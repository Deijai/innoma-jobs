import { colors } from './colors';
import { typography } from './typography';

export const lightTheme = {
  colors: {
    primary: colors.primary.light,
    secondary: colors.secondary.light,
    background: colors.background.light,
    card: colors.card.light,
    text: colors.text.light,
    border: colors.border.light,
    error: colors.error.light,
    success: colors.success.light,
    warning: colors.warning.light,
    info: colors.info.light,
  },
  typography,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};

export const darkTheme = {
  colors: {
    primary: colors.primary.dark,
    secondary: colors.secondary.dark,
    background: colors.background.dark,
    card: colors.card.dark,
    text: colors.text.dark,
    border: colors.border.dark,
    error: colors.error.dark,
    success: colors.success.dark,
    warning: colors.warning.dark,
    info: colors.info.dark,
  },
  typography,
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  shadow: lightTheme.shadow,
};