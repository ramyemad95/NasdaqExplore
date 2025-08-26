import { MD3LightTheme as PaperLightTheme } from 'react-native-paper';
import { transparent } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';

export const lightTheme = {
  ...PaperLightTheme,
  colors: {
    ...PaperLightTheme.colors,
    primary: '#0066cc',
    secondary: '#4a90e2',
    background: '#ffffff',
    surface: '#f8f9fa',
    surfaceVariant: '#f1f3f4',
    onBackground: '#1a1a1a',
    onSurface: '#1a1a1a',
    onSurfaceVariant: '#5f6368',
    outline: '#dadce0',
    outlineVariant: '#e8eaed',
    error: '#d93025',
    onError: '#ffffff',
    success: '#137333',
    onSuccess: '#ffffff',
    warning: '#ea8600',
    onWarning: '#ffffff',
    info: '#1a73e8',
    onInfo: '#ffffff',
    card: '#ffffff',
    border: '#e8eaed',
    text: '#1a1a1a',
    textSecondary: '#5f6368',
    textTertiary: '#9aa0a6',
    divider: '#dadce0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    transparent: 'rgba(0, 0, 0, 0.0)',
  },
};

export type AppTheme = typeof lightTheme;
