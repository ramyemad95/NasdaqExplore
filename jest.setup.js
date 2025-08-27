jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);
jest.mock('react-native-config', () => ({ API_KEY: 'test-key' }));
jest.mock('react-native-localize', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));
require('react-native-gesture-handler/jestSetup');

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    GestureHandlerRootView: ({ children, ...props }) =>
      React.createElement(View, props, children),
    PanGestureHandler: ({ children, ...props }) =>
      React.createElement(View, props, children),
    TapGestureHandler: ({ children, ...props }) =>
      React.createElement(View, props, children),
    State: {
      UNDETERMINED: 0,
      FAILED: 1,
      BEGAN: 2,
      CANCELLED: 3,
      ACTIVE: 4,
      END: 5,
    },
  };
});

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { View } = require('react-native');

  const BottomSheet = React.forwardRef(({ children, ...props }, ref) => {
    const mockRef = {
      current: {
        snapToIndex: jest.fn(),
        close: jest.fn(),
      },
    };

    if (ref) {
      ref.current = mockRef.current;
    }

    return React.createElement(View, { ...props, ref: mockRef }, children);
  });

  const BottomSheetBackdrop = ({ children, ...props }) => {
    return React.createElement(View, props, children);
  };

  const BottomSheetView = ({ children, ...props }) => {
    return React.createElement(View, props, children);
  };

  return {
    __esModule: true,
    default: BottomSheet,
    BottomSheetBackdrop,
    BottomSheetView,
  };
});
jest.mock('react-native-shimmer-placeholder', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => React.createElement('View', null),
  };
});
jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => React.createElement('View', null),
  };
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock redux-persist
jest.mock('redux-persist', () => {
  const realModule = jest.requireActual('redux-persist');
  return {
    ...realModule,
    persistReducer: jest.fn((config, reducer) => reducer),
    persistStore: jest.fn(() => ({
      purge: jest.fn(),
      flush: jest.fn(),
      pause: jest.fn(),
      persist: jest.fn(),
      resume: jest.fn(),
      subscribe: jest.fn(),
      getState: jest.fn(() => ({ bootstrapped: true })),
      dispatch: jest.fn(),
    })),
  };
});

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
    i18n: { changeLanguage: jest.fn() },
  }),
  I18nextProvider: ({ children }) => children,
  initReactI18next: jest.fn(),
}));

// Mock react-native-localize
jest.mock('react-native-localize', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));

// Mock the entire i18n module
jest.mock('./src/i18n', () => ({
  changeLanguage: jest.fn(),
  default: {
    use: jest.fn(() => ({ init: jest.fn() })),
    changeLanguage: jest.fn(),
  },
}));

// Mock ToastContext
jest.mock('./src/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: jest.fn(),
    hideToast: jest.fn(),
    toast: { visible: true, message: 'Test message', type: 'info' },
  }),
  ToastProvider: ({ children }) => children,
}));

// Mock react-native-paper theme
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  return {
    useTheme: () => ({
      colors: {
        primary: '#007AFF',
        surface: '#FFFFFF',
        onSurface: '#000000',
        onSurfaceVariant: '#666666',
        outline: '#666666',
      },
    }),
    Provider: ({ children }) => children,
    List: {
      Item: ({ title, description, children, ...props }) =>
        React.createElement(
          View,
          props,
          title && React.createElement(Text, { key: 'title' }, title),
          description &&
            React.createElement(Text, { key: 'description' }, description),
          children,
        ),
    },
    Button: ({ children, onPress, ...props }) =>
      React.createElement(Text, { ...props, onPress }, children),
    Snackbar: ({ children, visible, ...props }) =>
      visible ? React.createElement(View, props, children) : null,
    SegmentedButtons: ({
      children,
      value,
      onValueChange,
      buttons,
      ...props
    }) => {
      return React.createElement(
        View,
        {
          ...props,
          value,
          onValueChange,
          buttons,
          testID: `segmented-buttons-${value}`,
        },
        buttons?.map((button, index) =>
          React.createElement(
            View,
            {
              key: index,
              value: button.value,
              testID: `button-${button.value}`,
            },
            button.label,
          ),
        ),
      );
    },
    TextInput: ({ children, ...props }) =>
      React.createElement(View, { ...props }, children),
    Switch: ({ value, onValueChange, ...props }) =>
      React.createElement(View, { ...props, value, onValueChange }),
    Text: ({ children, ...props }) =>
      React.createElement(Text, { ...props }, children),
    // Minimal Searchbar mock to support onChangeText and placeholder
    Searchbar: ({
      placeholder,
      value,
      onChangeText,
      style,
      inputStyle,
      ...props
    }) =>
      React.createElement(View, {
        testID: 'searchbar',
        accessibilityLabel: placeholder,
        value,
        onChangeText,
        style,
        inputStyle,
        ...props,
      }),
    // Minimal IconButton mock to support onPress and accessibilityLabel
    IconButton: ({ onPress, accessibilityLabel, icon, ...props }) =>
      React.createElement(
        Text,
        { onPress, accessibilityLabel, testID: `icon-${icon}`, ...props },
        accessibilityLabel || icon,
      ),
    Card: ({ children, style, ...props }) => {
      const MockCard = React.createElement(
        'View',
        {
          testID: 'card',
          style,
          ...props,
        },
        children,
      );
      MockCard.Content = ({
        children: contentChildren,
        style: contentStyle,
        ...contentProps
      }) => {
        return React.createElement(
          'View',
          {
            testID: 'card-content',
            style: contentStyle,
            ...contentProps,
          },
          contentChildren,
        );
      };
      return MockCard;
    },
    Divider: ({ style, ...props }) =>
      React.createElement('View', {
        testID: 'divider',
        style: [{ height: 1, backgroundColor: '#e0e0e0' }, style],
        ...props,
      }),
    MD3DarkTheme: {
      colors: {
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
      },
    },
    MD3LightTheme: {
      colors: {
        primary: '#006495',
        secondary: '#4a6363',
        background: '#fdfbff',
        surface: '#fdfbff',
        surfaceVariant: '#dfe3eb',
        onBackground: '#1a1c1e',
        onSurface: '#1a1c1e',
        onSurfaceVariant: '#43474e',
        outline: '#73777f',
        outlineVariant: '#c3c7cf',
        error: '#ba1a1a',
        onError: '#ffffff',
        success: '#4caf50',
        onSuccess: '#ffffff',
        warning: '#ff9800',
        onWarning: '#ffffff',
        info: '#2196f3',
        onInfo: '#ffffff',
      },
    },
  };
});

// Global test utilities
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: jest.fn(),
};
