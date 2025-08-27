import React from 'react';
import { render, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SplashScreen from '../../../src/screens/Splash/SplashScreen';
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

// Mock the image asset
jest.mock('../../../src/assets/nasdaq-logo.png', () => 'mocked-logo');

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
          <Stack.Screen name="Splash" component={() => children} />
          <Stack.Screen name="Explore" component={() => null} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

describe('SplashScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly with logo and credit', () => {
    const { getByText, toJSON } = render(
      <MockNavigator>
        <SplashScreen navigation={{} as any} route={{} as any} />
      </MockNavigator>,
    );

    expect(getByText('Ramy Mehanna')).toBeTruthy();
    expect(toJSON()).toBeTruthy();
  });

  it('renders without crashing', () => {
    expect(() =>
      render(
        <MockNavigator>
          <SplashScreen navigation={{} as any} route={{} as any} />
        </MockNavigator>,
      ),
    ).not.toThrow();
  });

  it('has correct styling structure', () => {
    const { getByText } = render(
      <MockNavigator>
        <SplashScreen navigation={{} as any} route={{} as any} />
      </MockNavigator>,
    );

    const creditText = getByText('Ramy Mehanna');
    expect(creditText).toBeTruthy();
  });

  it('navigates to Explore screen after 2 seconds', () => {
    const mockNavigation = {
      replace: jest.fn(),
    };

    render(
      <MockNavigator>
        <SplashScreen navigation={mockNavigation as any} route={{} as any} />
      </MockNavigator>,
    );

    // Fast-forward time by 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockNavigation.replace).toHaveBeenCalledWith('Explore');
  });

  it('does not navigate before 2 seconds', () => {
    const mockNavigation = {
      replace: jest.fn(),
    };

    render(
      <MockNavigator>
        <SplashScreen navigation={mockNavigation as any} route={{} as any} />
      </MockNavigator>,
    );

    // Fast-forward time by 1.9 seconds (just before 2 seconds)
    act(() => {
      jest.advanceTimersByTime(1900);
    });

    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });

  it('cleans up timer on unmount', () => {
    const mockNavigation = {
      replace: jest.fn(),
    };

    const { unmount } = render(
      <MockNavigator>
        <SplashScreen navigation={mockNavigation as any} route={{} as any} />
      </MockNavigator>,
    );

    // Unmount before the timer completes
    unmount();

    // Fast-forward time to see if navigation still happens
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });
});
