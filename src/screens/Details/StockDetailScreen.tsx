import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, Divider, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAppTheme } from '../../theme';
import { HeaderCard } from './components/HeaderCard';
import { InfoCard } from './components/InfoCard';
import { InfoRow } from './components/InfoRow';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

const StockDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { stock } = route.params;
  const theme = useAppTheme();
  const { t } = useTranslation();

  // Memoize market color to prevent unnecessary recalculations
  const marketColor = useMemo(() => {
    const marketColors: { [key: string]: string } = {
      stocks: theme.colors.primary,
      crypto: theme.colors.secondary,
      fx: theme.colors.info,
      otc: theme.colors.warning,
      indices: theme.colors.success,
    };
    return marketColors[stock.market || 'stocks'] || theme.colors.outline;
  }, [stock.market, theme.colors]);

  // Memoize status color
  const statusColor = useMemo(() => {
    return stock.active ? theme.colors.success : theme.colors.error;
  }, [stock.active, theme.colors.success, theme.colors.error]);

  // Memoize market information data
  const marketInfo = useMemo(
    () => [
      { label: t('details.market'), value: stock.market, icon: '🏛️' },
      { label: t('details.locale'), value: stock.locale, icon: '🌍' },
      { label: t('details.currency'), value: stock.currency, icon: '💰' },
      {
        label: t('details.exchange'),
        value: stock.primary_exchange,
        icon: '📊',
      },
    ],
    [stock.market, stock.locale, stock.currency, stock.primary_exchange, t],
  );

  // Memoize legal information data
  const legalInfo = useMemo(
    () => [
      { label: t('details.cik'), value: stock.cik, icon: '🆔' },
      { label: t('details.cusip'), value: stock.cusip, icon: '🏷️' },
    ],
    [stock.cik, stock.cusip, t],
  );

  // Set navigation title
  React.useEffect(() => {
    navigation.setOptions({
      title: stock.ticker,
      headerStyle: {
        backgroundColor: theme.colors.surface,
      },
      headerTintColor: theme.colors.onSurface,
    });
  }, [navigation, stock.ticker, theme.colors.surface, theme.colors.onSurface]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <HeaderCard
        stock={stock}
        marketColor={marketColor}
        statusColor={statusColor}
        theme={theme}
      />

      <InfoCard
        title={t('details.marketInformation')}
        data={marketInfo}
        theme={theme}
      />

      <InfoCard
        title={t('details.legalInformation')}
        data={legalInfo}
        theme={theme}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
});

export default StockDetailScreen;
