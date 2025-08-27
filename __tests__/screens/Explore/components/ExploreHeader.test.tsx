import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ExploreHeader from '../../../../src/screens/Explore/components/ExploreHeader';
import filtersSlice from '../../../../src/store/filtersSlice';
import settingsSlice from '../../../../src/store/settingsSlice';
import stocksSlice from '../../../../src/store/stocksSlice';

// Mocks
jest.mock('../../../../src/hooks/useDebounce', () => ({
  useDebounce: (value: any) => value,
}));

const mockUseStocks = {
  searchStocks: jest.fn(),
  resetStocks: jest.fn(),
};

jest.mock('../../../../src/hooks/useStocks', () => ({
  useStocks: () => mockUseStocks,
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

// Provide a ref compatible object for filterSheetRef
const createRef = () => ({ current: { expand: jest.fn() } });

const createStore = (preloadedState: any = {}) =>
  configureStore({
    reducer: {
      filters: filtersSlice,
      settings: settingsSlice,
      stocks: stocksSlice,
    },
    preloadedState,
  });

const renderWithStore = (ui: React.ReactElement, preloadedState: any = {}) => {
  const store = createStore(preloadedState);
  const utils = render(<Provider store={store}>{ui}</Provider>);
  return { ...utils, store };
};

describe('ExploreHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders and triggers search on input change with filters', () => {
    const filterRef = createRef();
    const { getByLabelText } = renderWithStore(
      <ExploreHeader filterSheetRef={filterRef as any} />,
      { filters: { market: 'stocks' } },
    );

    const searchbar = getByLabelText('explore.searchPlaceholder');
    fireEvent(searchbar, 'onChangeText', 'AAPL');

    expect(mockUseStocks.resetStocks).toHaveBeenCalled();
    expect(mockUseStocks.searchStocks).toHaveBeenCalledWith('AAPL', {
      market: 'stocks',
    });
  });

  it('opens filter sheet when filter button pressed', () => {
    const filterRef = createRef();
    const { getByLabelText } = renderWithStore(
      <ExploreHeader filterSheetRef={filterRef as any} />,
    );

    const filterBtn = getByLabelText('Filters');
    fireEvent.press(filterBtn);
    expect(filterRef.current.expand).toHaveBeenCalled();
  });

  it('navigates to Settings on settings button press', () => {
    const navigate = jest.fn();
    (require('@react-navigation/native') as any).useNavigation = () => ({
      navigate,
    });

    const { getByLabelText } = renderWithStore(
      <ExploreHeader filterSheetRef={createRef() as any} />,
    );

    const settingsBtn = getByLabelText('Settings');
    fireEvent.press(settingsBtn);
    expect(navigate).toHaveBeenCalledWith('Settings');
  });

  it('renders RTL labels when isRTL is true', () => {
    const filterRef = createRef();
    const { getByLabelText } = renderWithStore(
      <ExploreHeader filterSheetRef={filterRef as any} />,
      {
        settings: {
          theme: 'light',
          language: 'ar',
          rtl: { isRTL: true, lastLanguage: 'ar' },
        },
        filters: {},
      },
    );

    expect(getByLabelText('فلاتر')).toBeTruthy();
    expect(getByLabelText('الإعدادات')).toBeTruthy();
  });
});
