import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Snackbar, useTheme } from 'react-native-paper';
import { useToast } from '../contexts/ToastContext';
import { useTranslation } from 'react-i18next';

const Toast: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { toast, hideToast } = useToast();

  const handleRetry = () => {
    if (toast.onRetry) {
      toast.onRetry();
    }
    hideToast();
  };

  return (
    <Snackbar
      visible={toast.visible}
      onDismiss={hideToast}
      duration={Infinity} // We'll handle duration manually
      style={[
        styles.snackbar,
        {
          backgroundColor: theme.colors.error,
          borderLeftWidth: 4,
          borderLeftColor: theme.colors.errorContainer,
        },
      ]}
      action={
        toast.onRetry
          ? {
              label: t('common.retry'),
              onPress: handleRetry,
              textColor: theme.colors.onError,
            }
          : undefined
      }
    >
      <Text style={[styles.message, { color: theme.colors.onError }]}>
        {toast.message}
      </Text>
    </Snackbar>
  );
};

const styles = StyleSheet.create({
  snackbar: {
    marginBottom: 20,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Toast;
