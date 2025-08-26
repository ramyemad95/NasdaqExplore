import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { PersistGate } from 'redux-persist/integration/react';
import { useAppTheme } from './theme';
import { I18nextProvider } from 'react-i18next';
import AppNavigator from './navigation/AppNavigator';
import { store, persistor } from './store';
import i18n from './i18n';
import { useSettings } from './hooks/useSettings';
import { useRTLSync } from './hooks/useRTLSync';
import { ToastProvider } from './contexts/ToastContext';
import Toast from './components/Toast';

const AppContent: React.FC = () => {
  const theme = useAppTheme();
  const { language } = useSettings();
  const { isRTL, isSynced } = useRTLSync();

  // Handle language changes
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  return (
    <PaperProvider theme={theme}>
      <ToastProvider>
        <AppNavigator />
        <Toast />
      </ToastProvider>
    </PaperProvider>
  );
};

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <I18nextProvider i18n={i18n}>
            <AppContent />
          </I18nextProvider>
        </PersistGate>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
};

export default App;
