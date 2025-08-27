import React from 'react';
import { render } from '@testing-library/react-native';

// Mock react-native-paper theme
jest.mock('react-native-paper', () => ({
  useTheme: () => ({
    colors: {
      surface: '#fff',
      onSurface: '#000',
    },
  }),
  // Provide minimal MD3 themes to satisfy light/dark theme imports
  MD3DarkTheme: {
    colors: {
      primary: '#000',
      background: '#111',
      surface: '#222',
      onSurface: '#fff',
      outline: '#444',
      outlineVariant: '#555',
      error: '#f00',
      onError: '#fff',
    },
  },
  MD3LightTheme: {
    colors: {
      primary: '#0066cc',
      background: '#ffffff',
      surface: '#f8f9fa',
      onSurface: '#1a1a1a',
      outline: '#dadce0',
      outlineVariant: '#e8eaed',
      error: '#d93025',
      onError: '#ffffff',
    },
  },
  PaperProvider: ({ children }: any) => children,
}));

// Mock navigation container and stack
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: any) => children,
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ children }: any) => children,
  }),
}));

describe('AppNavigator language branches', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('renders with English config (non-RTL branch)', () => {
    jest.doMock('../../src/hooks/useSettings', () => ({
      useSettings: () => ({ language: 'en' }),
    }));
    const { default: Navigator } = require('../../src/navigation/AppNavigator');
    expect(() => render(<Navigator />)).not.toThrow();
  });

  it('renders with Arabic config (RTL branch)', () => {
    jest.doMock('../../src/hooks/useSettings', () => ({
      useSettings: () => ({ language: 'ar' }),
    }));
    // Re-require after mocking
    const { default: Navigator } = require('../../src/navigation/AppNavigator');
    expect(() => render(<Navigator />)).not.toThrow();
  });
});
