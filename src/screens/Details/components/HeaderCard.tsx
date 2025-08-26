import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Chip, Text, Badge } from 'react-native-paper';
import { AppTheme } from '../../../theme';
import { Ticker } from '../../../store/stocksSlice';

interface HeaderCardProps {
  stock: Ticker;
  marketColor: string;
  statusColor: string;
  theme: AppTheme;
}

const HeaderCard: React.FC<HeaderCardProps> = memo(
  ({ stock, marketColor, statusColor, theme }) => {
    return (
      <Card
        style={[styles.headerCard, { backgroundColor: theme.colors.surface }]}
      >
        <Card.Content style={styles.headerContent}>
          <View style={styles.tickerSection}>
            <Text
              variant="displaySmall"
              style={[styles.ticker, { color: theme.colors.onSurface }]}
            >
              {stock.ticker}
            </Text>
            <Badge
              style={[styles.marketBadge, { backgroundColor: marketColor }]}
            >
              {stock.market?.toUpperCase() || 'STOCK'}
            </Badge>
          </View>

          <Text
            variant="titleLarge"
            style={[
              styles.companyName,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {stock.name}
          </Text>

          <View style={styles.statusSection}>
            <Chip
              icon={stock.active ? 'check-circle' : 'close-circle'}
              style={[styles.statusChip, { backgroundColor: statusColor }]}
              textStyle={{ color: theme.colors.onError }}
            >
              {stock.active ? 'Active' : 'Inactive'}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    );
  },
);

const styles = StyleSheet.create({
  headerCard: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    paddingVertical: 8,
  },
  tickerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ticker: {
    fontWeight: 'bold',
    flex: 1,
  },
  marketBadge: {
    marginLeft: 8,
  },
  companyName: {
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 28,
  },
  statusSection: {
    alignItems: 'center',
  },
  statusChip: {
    borderRadius: 20,
  },
});

export { HeaderCard };
