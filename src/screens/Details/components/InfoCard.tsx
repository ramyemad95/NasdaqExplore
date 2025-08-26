import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Card, Divider, Text } from 'react-native-paper';
import { AppTheme } from '../../../theme';
import { InfoRow } from './InfoRow';

interface InfoCardProps {
  title: string;
  data: Array<{ label: string; value: any; icon?: string }>;
  theme: AppTheme;
}

const InfoCard: React.FC<InfoCardProps> = memo(({ title, data, theme }) => {
  return (
    <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text
          variant="titleMedium"
          style={[styles.cardTitle, { color: theme.colors.onSurface }]}
        >
          {title}
        </Text>
        <Divider
          style={[
            styles.divider,
            { backgroundColor: theme.colors.outlineVariant },
          ]}
        />

        {data.map((item, index) => (
          <InfoRow
            key={index}
            label={item.label}
            value={item.value}
            icon={item.icon}
            theme={theme}
          />
        ))}
      </Card.Content>
    </Card>
  );
});

const styles = StyleSheet.create({
  infoCard: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  divider: {
    marginBottom: 16,
  },
});

export { InfoCard }; 