jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);
jest.mock('react-native-config', () => ({ API_KEY: 'test-key' }));
jest.mock('react-native-localize', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));
require('react-native-gesture-handler/jestSetup');
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const BottomSheet = React.forwardRef(() => null);
  const BottomSheetBackdrop = () => null;
  return { __esModule: true, default: BottomSheet, BottomSheetBackdrop };
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
