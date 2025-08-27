import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SettingsScreen from '../../../src/screens/Settings/SettingsScreen';
import stocksReducer from '../../../src/store/stocksSlice';
import filtersReducer from '../../../src/store/filtersSlice';
import settingsReducer from '../../../src/store/settingsSlice';

// Mock the ShimmerCard component
jest.mock('../../../src/components/Shimmer', () => ({
  ShimmerCard: () => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: 'shimmer-card' }, 'ShimmerCard');
  },
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: jest.fn() },
    ready: true,
  }),
}));

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      stocks: stocksReducer,
      filters: filtersReducer,
      settings: settingsReducer,
    },
    preloadedState: initialState,
  });
};

describe('SettingsScreen', () => {
  const defaultInitialState = {
    settings: {
      theme: 'light' as const,
      language: 'en' as const,
      rtl: { isRTL: false, lastLanguage: 'en' },
    },
  };

  it('renders correctly with all settings options', () => {
    const store = createTestStore(defaultInitialState);

    const { getByText, toJSON } = render(
      <Provider store={store}>
        <SettingsScreen />
      </Provider>,
    );

    expect(getByText('settings.appearance')).toBeTruthy();
    expect(getByText('settings.language')).toBeTruthy();
    expect(getByText('settings.light')).toBeTruthy();
    expect(getByText('settings.dark')).toBeTruthy();
    expect(getByText('settings.system')).toBeTruthy();
    expect(getByText('settings.english')).toBeTruthy();
    expect(getByText('settings.arabic')).toBeTruthy();
    expect(toJSON()).toBeTruthy();
  });

  it('renders without crashing', () => {
    const store = createTestStore(defaultInitialState);

    expect(() =>
      render(
        <Provider store={store}>
          <SettingsScreen />
        </Provider>,
      ),
    ).not.toThrow();
  });

  it('handles theme changes correctly', () => {
    const store = createTestStore(defaultInitialState);

    const { getByText } = render(
      <Provider store={store}>
        <SettingsScreen />
      </Provider>,
    );

    const darkThemeOption = getByText('settings.dark');
    fireEvent.press(darkThemeOption);

    const state = store.getState();
    expect(state.settings.theme).toBe('dark');
  });

  it('handles language changes correctly', async () => {
    const store = createTestStore(defaultInitialState);

    const { getByText } = render(
      <Provider store={store}>
        <SettingsScreen />
      </Provider>,
    );

    const arabicOption = getByText('settings.arabic');
    fireEvent.press(arabicOption);

    const state = store.getState();
    expect(state.settings.language).toBe('ar');
  });

  it('handles i18n ready state correctly', () => {
    const store = createTestStore(defaultInitialState);

    const { getByText } = render(
      <Provider store={store}>
        <SettingsScreen />
      </Provider>,
    );

    // Should render the settings content when i18n is ready
    expect(getByText('settings.appearance')).toBeTruthy();
    expect(getByText('settings.language')).toBeTruthy();
  });

  it('handles RTL language correctly', () => {
    const rtlInitialState = {
      settings: {
        theme: 'light' as const,
        language: 'ar' as const,
        rtl: { isRTL: true, lastLanguage: 'ar' },
      },
    };

    const store = createTestStore(rtlInitialState);

    const { getByText, toJSON } = render(
      <Provider store={store}>
        <SettingsScreen />
      </Provider>,
    );

    expect(getByText('settings.appearance')).toBeTruthy();
    expect(getByText('settings.language')).toBeTruthy();
    expect(toJSON()).toBeTruthy();
  });

  it('handles system theme correctly', () => {
    const systemThemeState = {
      settings: {
        theme: 'system' as const,
        language: 'en' as const,
        rtl: { isRTL: false, lastLanguage: 'en' },
      },
    };

    const store = createTestStore(systemThemeState);

    const { getByText, toJSON } = render(
      <Provider store={store}>
        <SettingsScreen />
      </Provider>,
    );

    expect(getByText('settings.appearance')).toBeTruthy();
    expect(getByText('settings.system')).toBeTruthy();
    expect(toJSON()).toBeTruthy();
  });

  it('has correct structure with all sections', () => {
    const store = createTestStore(defaultInitialState);

    const { getByText } = render(
      <Provider store={store}>
        <SettingsScreen />
      </Provider>,
    );

    // Verify all expected sections are present
    expect(getByText('settings.appearance')).toBeTruthy();
    expect(getByText('settings.language')).toBeTruthy();

    // Verify theme options
    expect(getByText('settings.light')).toBeTruthy();
    expect(getByText('settings.dark')).toBeTruthy();
    expect(getByText('settings.system')).toBeTruthy();

    // Verify language options
    expect(getByText('settings.english')).toBeTruthy();
    expect(getByText('settings.arabic')).toBeTruthy();
  });

  it('handles multiple theme changes', () => {
    const store = createTestStore(defaultInitialState);

    const { getByText } = render(
      <Provider store={store}>
        <SettingsScreen />
      </Provider>,
    );

    // Change to dark theme
    const darkThemeOption = getByText('settings.dark');
    fireEvent.press(darkThemeOption);

    let state = store.getState();
    expect(state.settings.theme).toBe('dark');

    // Change to system theme
    const systemThemeOption = getByText('settings.system');
    fireEvent.press(systemThemeOption);

    state = store.getState();
    expect(state.settings.theme).toBe('system');
  });

  it('handles multiple language changes', async () => {
    const store = createTestStore(defaultInitialState);

    const { getByText } = render(
      <Provider store={store}>
        <SettingsScreen />
      </Provider>,
    );

    // Change to Arabic
    const arabicOption = getByText('settings.arabic');
    fireEvent.press(arabicOption);

    let state = store.getState();
    expect(state.settings.language).toBe('ar');

    // Change back to English
    const englishOption = getByText('settings.english');
    fireEvent.press(englishOption);

    state = store.getState();
    expect(state.settings.language).toBe('en');
  });
});
