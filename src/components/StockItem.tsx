import React, { useCallback, useMemo } from 'react';
import { List, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ticker } from '../store/stocksSlice';
import { StyleSheet } from 'react-native';
import { useRTL } from '../hooks/useRTL';

type Props = { ticker: string; name: string; stock?: Ticker };

const StockItem: React.FC<Props> = React.memo(({ ticker, name, stock }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const { textAlign } = useRTL();

  // Memoize the navigation function to prevent unnecessary re-renders
  const handlePress = useCallback(() => {
    navigation.navigate('Details', {
      stock: stock ?? ({ ticker, name } as Ticker),
    });
  }, [navigation, stock, ticker, name]);

  // Memoize the title style to prevent recreation
  const titleStyle = useMemo(
    () => [
      styles.title,
      {
        color: theme.colors.onSurface,
        textAlign: textAlign as any,
      },
    ],
    [theme.colors.onSurface, textAlign],
  );

  // Memoize the description style to prevent recreation
  const descriptionStyle = useMemo(
    () => [
      styles.description,
      {
        color: theme.colors.onSurfaceVariant,
        textAlign: textAlign as any,
      },
    ],
    [theme.colors.onSurfaceVariant, textAlign],
  );

  // Memoize the container style to prevent recreation
  const containerStyle = useMemo(
    () => [styles.container, { backgroundColor: theme.colors.surface }],
    [theme.colors.surface],
  );

  return (
    <List.Item
      title={ticker}
      description={name}
      titleStyle={titleStyle}
      descriptionStyle={descriptionStyle}
      style={containerStyle}
      onPress={handlePress}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
  },
  description: {
    fontSize: 14,
  },
});

export default StockItem;
