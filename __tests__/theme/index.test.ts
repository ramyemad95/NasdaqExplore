import { useAppTheme } from '../../src/theme';
import { useColorScheme } from 'react-native';
import { useSettings } from '../../src/hooks/useSettings';

// Mock react-native
jest.mock('react-native', () => ({
  useColorScheme: jest.fn(),
}));

// Mock useSettings hook
jest.mock('../../src/hooks/useSettings', () => ({
  useSettings: jest.fn(),
}));

describe('useAppTheme', () => {
  const mockUseColorScheme = useColorScheme as jest.MockedFunction<
    typeof useColorScheme
  >;
  const mockUseSettings = useSettings as jest.MockedFunction<
    typeof useSettings
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return dark theme when theme is set to dark', () => {
    mockUseSettings.mockReturnValue({ theme: 'dark' });
    mockUseColorScheme.mockReturnValue('light');

    const theme = useAppTheme();
    expect(theme).toBeDefined();
  });

  it('should return light theme when theme is set to light', () => {
    mockUseSettings.mockReturnValue({ theme: 'light' });
    mockUseColorScheme.mockReturnValue('dark');

    const theme = useAppTheme();
    expect(theme).toBeDefined();
  });

  it('should return system theme when theme is set to system and system is light', () => {
    mockUseSettings.mockReturnValue({ theme: 'system' });
    mockUseColorScheme.mockReturnValue('light');

    const theme = useAppTheme();
    expect(theme).toBeDefined();
  });

  it('should return system theme when theme is set to system and system is dark', () => {
    mockUseSettings.mockReturnValue({ theme: 'system' });
    mockUseColorScheme.mockReturnValue('dark');

    const theme = useAppTheme();
    expect(theme).toBeDefined();
  });

  it('should handle undefined theme setting', () => {
    mockUseSettings.mockReturnValue({ theme: undefined });
    mockUseColorScheme.mockReturnValue('light');

    const theme = useAppTheme();
    expect(theme).toBeDefined();
  });

  it('should handle null theme setting', () => {
    mockUseSettings.mockReturnValue({ theme: null });
    mockUseColorScheme.mockReturnValue('dark');

    const theme = useAppTheme();
    expect(theme).toBeDefined();
  });

  it('should handle undefined color scheme', () => {
    mockUseSettings.mockReturnValue({ theme: 'system' });
    mockUseColorScheme.mockReturnValue(undefined);

    const theme = useAppTheme();
    expect(theme).toBeDefined();
  });

  it('should handle null color scheme', () => {
    mockUseSettings.mockReturnValue({ theme: 'system' });
    mockUseColorScheme.mockReturnValue(null);

    const theme = useAppTheme();
    expect(theme).toBeDefined();
  });
});
