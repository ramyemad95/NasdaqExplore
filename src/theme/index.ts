import { useColorScheme } from 'react-native';
import { darkTheme } from './dark';
import { lightTheme } from './light';
import { useSettings } from '../hooks/useSettings';

export const useAppTheme = () => {
  const systemScheme = useColorScheme();
  const { theme } = useSettings();

  if (theme === 'system') {
    return systemScheme === 'dark' ? darkTheme : lightTheme;
  }

  return theme === 'dark' ? darkTheme : lightTheme;
};

export type { AppTheme } from './light';
export { lightTheme, darkTheme };
