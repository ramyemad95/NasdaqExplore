import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import StockDetailScreen from '../../../src/screens/Details/StockDetailScreen';
import stocksReducer from '../../../src/store/stocksSlice';
import filtersReducer from '../../../src/store/filtersSlice';
import settingsReducer from '../../../src/store/settingsSlice';

// Mock the theme module to avoid PaperDarkTheme issues
jest.mock('../../../src/theme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#FFFFFF',
      onBackground: '#000000',
      primary: '#007AFF',
      secondary: '#5856D6',
      info: '#5AC8FA',
      warning: '#FF9500',
      success: '#34C759',
      error: '#FF3B30',
      outline: '#8E8E93',
      surface: '#FFFFFF',
      onSurface: '#000000',
      onSurfaceVariant: '#666666',
    },
  }),
}));

// Mock the child components
jest.mock('../../../src/screens/Details/components/HeaderCard', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockHeaderCard = ({ stock, marketColor, statusColor, theme }: any) =>
    React.createElement(
      View,
      { testID: 'header-card' },
      `HeaderCard-${stock.ticker}`,
    );
  return { HeaderCard: MockHeaderCard };
});

jest.mock('../../../src/screens/Details/components/InfoCard', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockInfoCard = ({ title, data, theme }: any) =>
    React.createElement(View, { testID: `info-card-${title}` }, title);
  return { InfoCard: MockInfoCard };
});

jest.mock('../../../src/screens/Details/components/InfoRow', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockInfoRow = ({ label, value, icon, theme }: any) =>
    React.createElement(
      View,
      { testID: `info-row-${label}` },
      `${label}: ${value}`,
    );
  return { InfoRow: MockInfoRow };
});

const Stack = createNativeStackNavigator();

const createTestStore = () => {
  return configureStore({
    reducer: {
      stocks: stocksReducer,
      filters: filtersReducer,
      settings: settingsReducer,
    },
  });
};

const MockNavigator = ({ children }: { children: React.ReactNode }) => {
  const store = createTestStore();

  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Details" component={() => children} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

const mockStock = {
  ticker: 'AAPL',
  name: 'Apple Inc.',
  market: 'stocks',
  locale: 'US',
  currency: 'USD',
  primary_exchange: 'NASDAQ',
  active: true,
  cik: '0000320193',
  cusip: '037833100',
};

const mockRoute = {
  params: { stock: mockStock },
  key: 'test-key',
  name: 'Details',
};

const mockNavigation = {
  setOptions: jest.fn(),
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('StockDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with all components', () => {
    const { getByTestId, toJSON } = render(
      <MockNavigator>
        <StockDetailScreen
          navigation={mockNavigation as any}
          route={mockRoute as any}
        />
      </MockNavigator>,
    );

    expect(getByTestId('header-card')).toBeTruthy();
    expect(getByTestId('info-card-details.marketInformation')).toBeTruthy();
    expect(getByTestId('info-card-details.legalInformation')).toBeTruthy();
    expect(toJSON()).toBeTruthy();
  });

  it('renders without crashing', () => {
    expect(() =>
      render(
        <MockNavigator>
          <StockDetailScreen
            navigation={mockNavigation as any}
            route={mockRoute as any}
          />
        </MockNavigator>,
      ),
    ).not.toThrow();
  });

  it('sets navigation options correctly', () => {
    render(
      <MockNavigator>
        <StockDetailScreen
          navigation={mockNavigation as any}
          route={mockRoute as any}
        />
      </MockNavigator>,
    );

    expect(mockNavigation.setOptions).toHaveBeenCalledWith({
      title: 'AAPL',
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
      headerTintColor: '#000000',
    });
  });

  it('handles different market types correctly', () => {
    const cryptoStock = { ...mockStock, market: 'crypto' };
    const cryptoRoute = { ...mockRoute, params: { stock: cryptoStock } };

    const { getByTestId } = render(
      <MockNavigator>
        <StockDetailScreen
          navigation={mockNavigation as any}
          route={cryptoRoute as any}
        />
      </MockNavigator>,
    );

    expect(getByTestId('header-card')).toBeTruthy();
    expect(getByTestId('info-card-details.marketInformation')).toBeTruthy();
    expect(getByTestId('info-card-details.legalInformation')).toBeTruthy();
  });

  it('handles inactive stocks correctly', () => {
    const inactiveStock = { ...mockStock, active: false };
    const inactiveRoute = { ...mockRoute, params: { stock: inactiveStock } };

    const { getByTestId } = render(
      <MockNavigator>
        <StockDetailScreen
          navigation={mockNavigation as any}
          route={inactiveRoute as any}
        />
      </MockNavigator>,
    );

    expect(getByTestId('header-card')).toBeTruthy();
    expect(getByTestId('info-card-details.marketInformation')).toBeTruthy();
    expect(getByTestId('info-card-details.legalInformation')).toBeTruthy();
  });

  it('handles stocks with missing optional fields', () => {
    const minimalStock = {
      ticker: 'TEST',
      name: 'Test Company',
      market: 'stocks',
      active: true,
    };
    const minimalRoute = { ...mockRoute, params: { stock: minimalStock } };

    const { getByTestId } = render(
      <MockNavigator>
        <StockDetailScreen
          navigation={mockNavigation as any}
          route={minimalRoute as any}
        />
      </MockNavigator>,
    );

    expect(getByTestId('header-card')).toBeTruthy();
    expect(getByTestId('info-card-details.marketInformation')).toBeTruthy();
    expect(getByTestId('info-card-details.legalInformation')).toBeTruthy();
  });

  it('has correct structure with all components', () => {
    const { getByTestId } = render(
      <MockNavigator>
        <StockDetailScreen
          navigation={mockNavigation as any}
          route={mockRoute as any}
        />
      </MockNavigator>,
    );

    // Verify all expected components are present
    const headerCard = getByTestId('header-card');
    const marketInfoCard = getByTestId('info-card-details.marketInformation');
    const legalInfoCard = getByTestId('info-card-details.legalInformation');

    expect(headerCard).toBeTruthy();
    expect(marketInfoCard).toBeTruthy();
    expect(legalInfoCard).toBeTruthy();
  });
});
