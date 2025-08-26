import React, {
  forwardRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
  useImperativeHandle,
} from 'react';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { View, StyleSheet } from 'react-native';
import {
  Button,
  SegmentedButtons,
  TextInput,
  Switch,
  Text,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { resetFilters, setFilters } from '../store/filtersSlice';
import { useAppTheme } from '../theme';
import { useRTL } from '../hooks/useRTL';
import { useToast } from '../contexts/ToastContext';
import { useTranslation } from 'react-i18next';

export interface BottomSheetFilterRef {
  expand: () => void;
  close: () => void;
}

const BottomSheetFilter = forwardRef<BottomSheetFilterRef>((_, ref) => {
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);
  const dispatch = useDispatch<AppDispatch>();
  const { showError } = useToast();
  const filters = useSelector((s: RootState) => s.filters);
  const { error, status, errorDetails } = useSelector(
    (s: RootState) => s.stocks,
  );
  const bottomSheetRef = useRef<BottomSheet>(null);
  const theme = useAppTheme();
  const { textAlign, isRTL } = useRTL();
  const { t } = useTranslation();

  const [local, setLocal] = useState(filters);

  // Show error toast when there's an error
  useEffect(() => {
    if (error && status === 'error') {
      const retryFunction = () => {
        console.log(
          '🔄 Retrying based on error type:',
          errorDetails?.errorType,
        );
        dispatch(setFilters(local));
      };
      showError(error, retryFunction);
    }
  }, [error, status, errorDetails, dispatch, local, showError]);

  // Expose methods to parent component
  useImperativeHandle(
    ref,
    () => ({
      expand: () => {
        if (bottomSheetRef.current) {
          try {
            bottomSheetRef.current.snapToIndex(1); // Snap to 50%
          } catch (error) {
            // Handle error silently
          }
        }
      },
      close: () => {
        if (bottomSheetRef.current) {
          try {
            bottomSheetRef.current.close();
          } catch (error) {
            // Handle error silently
          }
        }
      },
    }),
    [],
  );

  const onApply = useCallback(() => {
    dispatch(setFilters(local));
    bottomSheetRef.current?.close();
  }, [local, dispatch]);

  const onReset = useCallback(() => {
    dispatch(resetFilters());
    setLocal({});
  }, [dispatch]);

  const handleChange = useCallback((index: number) => {
    // Handle index change silently
  }, []);

  // Memoize market options with localization
  const marketOptions = useMemo(
    () => [
      { value: 'stocks' as const, label: t('filters.marketOptions.stocks') },
      { value: 'crypto' as const, label: t('filters.marketOptions.crypto') },
      { value: 'fx' as const, label: t('filters.marketOptions.fx') },
      { value: 'otc' as const, label: t('filters.marketOptions.otc') },
      { value: 'indices' as const, label: t('filters.marketOptions.indices') },
    ],
    [t],
  );

  // Memoize order options with localization
  const orderOptions = useMemo(
    () => [
      { value: 'asc', label: t('filters.orderOptions.asc') },
      { value: 'desc', label: t('filters.orderOptions.desc') },
    ],
    [t],
  );

  // Memoize sort options with localization
  const sortOptions = useMemo(
    () => [
      { value: 'ticker', label: t('filters.sortOptions.ticker') },
      { value: 'name', label: t('filters.sortOptions.name') },
    ],
    [t],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      enableOverDrag={false}
      enableHandlePanningGesture={true}
      style={{ zIndex: 9999, elevation: 9999 }}
      containerStyle={{ zIndex: 9999, elevation: 9999 }}
      handleStyle={{
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.colors.outline,
        width: 40,
        height: 4,
      }}
      backdropComponent={props => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
        />
      )}
      onChange={handleChange}
    >
      <BottomSheetView
        style={{
          padding: 12,
          gap: 12,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 8,
            color: theme.colors.onSurface,
          }}
        >
          {t('filters.title')}
        </Text>

        <SegmentedButtons
          value={local.market ?? 'stocks'}
          onValueChange={v => setLocal({ ...local, market: v })}
          buttons={marketOptions}
          style={{ marginBottom: 8 }}
        />

        <SegmentedButtons
          value={local.order ?? 'asc'}
          onValueChange={v =>
            setLocal({ ...local, order: v as 'asc' | 'desc' })
          }
          buttons={orderOptions}
          style={{ marginBottom: 8 }}
        />

        <SegmentedButtons
          value={local.sort ?? 'ticker'}
          onValueChange={v => setLocal({ ...local, sort: v })}
          buttons={sortOptions}
          style={{ marginBottom: 8 }}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <Text style={{ color: theme.colors.onSurface }}>
            {t('filters.active')}
          </Text>
          <Switch
            value={!!local.active}
            onValueChange={v => setLocal({ ...local, active: v })}
          />
        </View>

        <View
          style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <Button onPress={onReset} mode="outlined" style={{ flex: 1 }}>
            {t('filters.reset')}
          </Button>
          <Button onPress={onApply} mode="contained" style={{ flex: 1 }}>
            {t('filters.apply')}
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default BottomSheetFilter;
