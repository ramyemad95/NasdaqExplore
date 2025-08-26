import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { AppTheme } from '../../../theme';

interface InfoRowProps {
  label: string;
  value: any;
  icon?: string;
  theme: AppTheme;
}

const InfoRow: React.FC<InfoRowProps> = memo(({ label, value, icon, theme }) => {
  const formatValue = (value: any) => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return value.toString();
  };

  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabel}>
        {icon && (
          <Text style={[styles.infoIcon, { color: theme.colors.primary }]}>
            {icon}
          </Text>
        )}
        <Text
          style={[
            styles.infoLabelText,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {label}
        </Text>
      </View>
      <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
        {formatValue(value)}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoLabelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
});

export { InfoRow }; 