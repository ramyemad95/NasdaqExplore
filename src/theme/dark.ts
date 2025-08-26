import { MD3DarkTheme as PaperDarkTheme } from 'react-native-paper';

export const darkTheme = {
  ...PaperDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,
    primary: '#4da3ff',
    secondary: '#7bb3ff',
    background: '#121212',
    surface: '#1e1e1e',
    surfaceVariant: '#2d2d2d',
    onBackground: '#ffffff',
    onSurface: '#ffffff',
    onSurfaceVariant: '#b3b3b3',
    outline: '#3c3c3c',
    outlineVariant: '#4d4d4d',
    error: '#f28b82',
    onError: '#000000',
    success: '#81c995',
    onSuccess: '#000000',
    warning: '#fdd663',
    onWarning: '#000000',
    info: '#8ab4f8',
    onInfo: '#000000',
    card: '#1e1e1e',
    border: '#3c3c3c',
    text: '#ffffff',
    textSecondary: '#b3b3b3',
    textTertiary: '#808080',
    divider: '#3c3c3c',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    transparent: 'rgba(0, 0, 0, 0.0)',
  },
};

export type AppTheme = typeof darkTheme;
