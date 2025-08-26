import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import ExploreHeader from './components/ExploreHeader';
import StockList from './components/StockList';
import BottomSheetFilter, {
  BottomSheetFilterRef,
} from '../../components/BottomSheetFilter';

const ExploreScreen: React.FC = React.memo(() => {
  const theme = useTheme();
  const filterSheetRef = useRef<BottomSheetFilterRef>(null);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ExploreHeader filterSheetRef={filterSheetRef} />
      <StockList />
      <BottomSheetFilter ref={filterSheetRef} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ExploreScreen;
