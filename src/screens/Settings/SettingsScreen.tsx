import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Switch, Text, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  setTheme,
  setLanguage,
  Theme,
  Language,
} from '../../store/settingsSlice';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../../hooks/useRTL';
import { ShimmerCard } from '../../components/Shimmer';

const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme, language } = useSelector((state: RootState) => state.settings);
  const { colors } = useTheme();
  const { t, i18n, ready } = useTranslation();
  const { textAlign } = useRTL();

  const handleThemeChange = useCallback(
    (newTheme: Theme) => {
      dispatch(setTheme(newTheme));
    },
    [dispatch],
  );

  const handleLanguageChange = useCallback(
    async (newLanguage: Language) => {
      // Update Redux state first (RTL will be updated automatically)
      dispatch(setLanguage(newLanguage));
      // Change i18n language
      await i18n.changeLanguage(newLanguage);
    },
    [dispatch, i18n],
  );

  // Don't render until i18n is ready
  if (!ready) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ShimmerCard />
        <ShimmerCard />
        <ShimmerCard />
      </View>
    );
  }

  // Memoize options to prevent unnecessary re-renders
  const themeOptions = [
    { value: 'light' as Theme, label: t('settings.light') },
    { value: 'dark' as Theme, label: t('settings.dark') },
    { value: 'system' as Theme, label: t('settings.system') },
  ];

  const languageOptions = [
    { value: 'en' as Language, label: t('settings.english') },
    { value: 'ar' as Language, label: t('settings.arabic') },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.section}>
        <Text
          variant="titleMedium"
          style={[
            styles.sectionTitle,
            {
              color: colors.primary,
              textAlign: textAlign as any,
            },
          ]}
        >
          {t('settings.appearance')}
        </Text>
        {themeOptions.map(option => (
          <List.Item
            key={option.value}
            title={option.label}
            onPress={() => handleThemeChange(option.value)}
            style={[styles.listItem, { backgroundColor: colors.surface }]}
            titleStyle={[
              styles.listItemTitle,
              {
                color: colors.onSurface,
                textAlign: textAlign as any,
              },
            ]}
            right={() => (
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: colors.primary,
                      backgroundColor:
                        theme === option.value ? colors.primary : 'transparent',
                    },
                  ]}
                />
              </View>
            )}
          />
        ))}
      </View>

      <View style={styles.section}>
        <Text
          variant="titleMedium"
          style={[
            styles.sectionTitle,
            {
              color: colors.primary,
              textAlign: textAlign as any,
            },
          ]}
        >
          {t('settings.language')}
        </Text>
        {languageOptions.map(option => (
          <List.Item
            key={option.value}
            title={option.label}
            onPress={() => handleLanguageChange(option.value)}
            style={[styles.listItem, { backgroundColor: colors.surface }]}
            titleStyle={[
              styles.listItemTitle,
              {
                color: colors.onSurface,
                textAlign: textAlign as any,
              },
            ]}
            right={() => (
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: colors.primary,
                      backgroundColor:
                        language === option.value
                          ? colors.primary
                          : 'transparent',
                    },
                  ]}
                />
              </View>
            )}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  listItem: {
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
  },
  listItemTitle: {
    fontWeight: '500',
  },
  radioContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
});

export default SettingsScreen;
