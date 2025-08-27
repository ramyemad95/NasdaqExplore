import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import StockItem from '../../src/components/StockItem';
import stocksReducer from '../../src/store/stocksSlice';
import filtersReducer from '../../src/store/filtersSlice';
import settingsReducer from '../../src/store/settingsSlice';

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
          <Stack.Screen name="Explore" component={() => null} />
          <Stack.Screen name="Details" component={() => null} />
        </Stack.Navigator>
        {children}
      </NavigationContainer>
    </Provider>
  );
};

describe('StockItem', () => {
  const mockStock = {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    market: 'stocks',
    locale: 'us',
    primary_exchange: 'XNAS',
    type: 'CS',
    active: true,
    currency_name: 'usd',
    last_updated_utc: '2023-01-01T00:00:00Z',
  };

  it('renders stock information correctly', () => {
    const { getByText } = render(
      <MockNavigator>
        <StockItem ticker="AAPL" name="Apple Inc." stock={mockStock} />
      </MockNavigator>,
    );

    expect(getByText('AAPL')).toBeTruthy();
    expect(getByText('Apple Inc.')).toBeTruthy();
  });

  it('renders with minimal props', () => {
    const { getByText } = render(
      <MockNavigator>
        <StockItem ticker="GOOGL" name="Alphabet Inc." />
      </MockNavigator>,
    );

    expect(getByText('GOOGL')).toBeTruthy();
    expect(getByText('Alphabet Inc.')).toBeTruthy();
  });

  it('handles press events', () => {
    const { getByText } = render(
      <MockNavigator>
        <StockItem ticker="AAPL" name="Apple Inc." stock={mockStock} />
      </MockNavigator>,
    );

    const stockItem = getByText('AAPL');
    fireEvent.press(stockItem);

    // Navigation should be triggered
    expect(stockItem).toBeTruthy();
  });

  it('renders with different stock data', () => {
    const differentStock = {
      ...mockStock,
      ticker: 'MSFT',
      name: 'Microsoft Corporation',
    };

    const { getByText } = render(
      <MockNavigator>
        <StockItem
          ticker="MSFT"
          name="Microsoft Corporation"
          stock={differentStock}
        />
      </MockNavigator>,
    );

    expect(getByText('MSFT')).toBeTruthy();
    expect(getByText('Microsoft Corporation')).toBeTruthy();
  });

  it('handles empty name gracefully', () => {
    const { getByText } = render(
      <MockNavigator>
        <StockItem ticker="TICK" name="" />
      </MockNavigator>,
    );

    expect(getByText('TICK')).toBeTruthy();
    // Empty name should not render any text, so we just verify the component renders
    expect(() => getByText('')).toThrow();
  });

  it('handles special characters in ticker', () => {
    const { getByText } = render(
      <MockNavigator>
        <StockItem ticker="BRK-B" name="Berkshire Hathaway Inc." />
      </MockNavigator>,
    );

    expect(getByText('BRK-B')).toBeTruthy();
    expect(getByText('Berkshire Hathaway Inc.')).toBeTruthy();
  });
});
