# 📱 Nasdaq Explore - Professional React Native Application

[![React Native](https://img.shields.io/badge/React%20Native-0.81.0-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.8.2-purple.svg)](https://redux-toolkit.js.org/)
[![Jest Coverage](https://img.shields.io/badge/Jest%20Coverage-75%25-green.svg)](https://jestjs.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Enterprise-grade React Native application** demonstrating modern mobile development practices, scalable architecture, and comprehensive testing strategies.

## 🚀 Project Overview

**Nasdaq Explore** is a professional-grade React Native application that provides real-time access to Nasdaq market data through the Polygon.io API. This project showcases advanced mobile development techniques, scalable architecture patterns, and industry best practices.

### 🎯 Key Features

- **Real-time Market Data**: Live access to Nasdaq tickers, crypto, FX, and indices
- **Advanced Search & Filtering**: Debounced search with comprehensive market filters
- **Infinite Scroll & Pagination**: Optimized data loading with smooth UX
- **Internationalization**: Full RTL support for Arabic and English
- **Theme System**: Dynamic light/dark theme switching
- **Offline Support**: Redux Persist with intelligent caching strategies
- **Performance Optimized**: React.memo, useCallback, and useMemo implementations

## 🏗️ Architecture & Design Patterns

### 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── hooks/              # Custom business logic hooks
├── i18n/               # Internationalization
├── navigation/         # React Navigation setup
├── screens/            # Screen components
├── services/           # API and external services
├── store/              # Redux Toolkit state management
├── theme/              # Design system and theming
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and helpers
```

### 🧩 Core Architecture Principles

#### 1. **Layered Architecture**

- **Presentation Layer**: React components with proper separation of concerns
- **Business Logic Layer**: Custom hooks and Redux slices
- **Data Layer**: API services with interceptors and caching
- **Infrastructure Layer**: Error handling, logging, and utilities

#### 2. **State Management Strategy**

```typescript
// Redux Toolkit with TypeScript
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});
```

#### 3. **Custom Hooks Pattern**

```typescript
// Business logic encapsulation
export const useStocks = () => {
  const dispatch = useDispatch<AppDispatch>();
  const stocks = useSelector((state: RootState) => state.stocks);

  const searchStocks = useCallback(
    (search?: string, filters?: StockFilters) => {
      dispatch(fetchStocks({ search, filters }));
    },
    [dispatch],
  );

  return { stocks, searchStocks, isLoading, hasError };
};
```

#### 4. **Service Layer Architecture**

```typescript
// API service with interceptors
export const apiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 10000,
});

// Request/Response interceptors for authentication and error handling
interceptorService.setupInterceptors(apiClient);
```

## 🔄 Data Flow & State Management

### 📊 Redux Store Structure

```typescript
interface RootState {
  stocks: StocksState; // Market data and pagination
  filters: FiltersState; // Search and filter criteria
  settings: SettingsState; // App preferences and theme
}
```

### 🔄 Data Flow Diagram

```
User Action → Component → Custom Hook → Redux Action → API Service → Store Update → UI Re-render
     ↓
Error Handling → Toast Notification → User Feedback
```

### 📱 Component Communication

- **Props Down**: Data and callbacks passed from parent to child
- **Events Up**: User interactions bubble up through callback chains
- **Context**: Global state (theme, language) shared across components
- **Redux**: Business logic and API state management

## 🧪 Testing Strategy & Quality Assurance

### 🎯 Testing Architecture

- **Unit Tests**: Individual component and hook testing
- **Integration Tests**: Redux store and API service testing
- **Component Tests**: UI component behavior validation
- **Coverage Threshold**: 75% minimum coverage enforced

### 📊 Test Coverage

```bash
npm run test:coverage
# Results: 75%+ coverage across all metrics
# - Branches: 75%
# - Functions: 75%
# - Lines: 75%
# - Statements: 75%
```

### 🧪 Testing Examples

```typescript
// Component testing with React Testing Library
describe('StockItem', () => {
  it('renders stock information correctly', () => {
    const { getByText } = render(<StockItem ticker="AAPL" name="Apple Inc." />);

    expect(getByText('AAPL')).toBeInTheDocument();
    expect(getByText('Apple Inc.')).toBeInTheDocument();
  });
});

// Hook testing with custom render
describe('useStocks', () => {
  it('fetches stocks on search', async () => {
    const { result } = renderHook(() => useStocks());

    act(() => {
      result.current.searchStocks('AAPL');
    });

    expect(result.current.isLoading).toBe(true);
  });
});
```

## 🚀 Performance Optimization

### ⚡ React Performance Techniques

- **React.memo**: Prevents unnecessary re-renders
- **useCallback**: Memoizes function references
- **useMemo**: Caches expensive calculations
- **Proper dependency arrays**: Optimizes hook re-execution

### 📱 Mobile-Specific Optimizations

- **Shimmer placeholders**: Smooth loading states
- **Infinite scroll**: Efficient data pagination
- **Image optimization**: Proper asset management
- **Memory management**: Component cleanup and unmounting

## 🌍 Internationalization & Accessibility

### 🌐 Multi-language Support

- **English & Arabic**: Full RTL support
- **Dynamic language switching**: Runtime language changes
- **Localized content**: Market-specific terminology
- **Accessibility labels**: Screen reader support

### ♿ Accessibility Features

- **Semantic markup**: Proper component hierarchy
- **Screen reader support**: Accessibility labels and hints
- **Color contrast**: Theme-aware color schemes
- **Touch targets**: Proper button sizes for mobile

## 🔧 Development Workflow & CI/CD

### 🛠️ Development Environment

```bash
# Prerequisites
- Node.js 18+
- React Native CLI
- Android Studio / Xcode
- Ruby (for iOS CocoaPods)

# Setup
npm install
cd ios && bundle install && bundle exec pod install

# Development
npm run ios          # iOS simulator
npm run android      # Android emulator
npm start            # Metro bundler
```

### 📋 Available Scripts

```json
{
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint .",
    "clean-install": "rm -rf node_modules && npm install"
  }
}
```


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer Profile

**Ramy Mehanna** - Senior React Native Developer

- **Expertise**: React Native, TypeScript, Redux, Mobile Architecture
- **Experience**: 7+ years in mobile development
- **Specializations**: Performance optimization, Testing, CI/CD
- **Contact**: [LinkedIn](https://linkedin.com/in/ramy-mehanna) | [GitHub](https://github.com/ramy-mehanna)

---
