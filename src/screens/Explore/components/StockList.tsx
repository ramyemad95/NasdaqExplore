import React, { useCallback, useMemo, useEffect } from 'react';
import { View, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useTheme, Text, Button } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import { fetchStocks } from '../../../store/stocksSlice';
import StockItem from '../../../components/StockItem';
import {
  ShimmerList,
  ShimmerText,
  InitialShimmerList,
} from '../../../components/Shimmer';
import { useRTL } from '../../../hooks/useRTL';
import { useTranslation } from 'react-i18next';
import { Animated } from 'react-native';

const StockList: React.FC = React.memo(() => {
  const theme = useTheme();
  const { textAlign } = useRTL();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { list, status, pagination, error, errorDetails, lastRequestedUrl } =
    useSelector((state: RootState) => state.stocks);
  const filters = useSelector((state: RootState) => state.filters);

  // Local loading state for retry operations
  const [isRetrying, setIsRetrying] = React.useState(false);

  // Reset retry loading state when status changes
  useEffect(() => {
    if (status === 'loading' || status === 'idle') {
      setIsRetrying(false);
    }
  }, [status]);

  // Memoize filters string to prevent unnecessary API calls
  const filtersString = useMemo(() => JSON.stringify(filters), [filters]);

  // Memoize the loadMore function to prevent unnecessary re-renders
  const loadMore = useCallback(() => {
    if (status === 'loading') {
      return;
    }

    if (!pagination.next_url) {
      return;
    }

    dispatch(fetchStocks({ filters, next_url: pagination.next_url }));
  }, [dispatch, filtersString, pagination.next_url, status]);

  // Memoize the onRefresh function
  const onRefresh = useCallback(() => {
    dispatch(fetchStocks({ search: '', filters }));
  }, [dispatch, filtersString]);

  // Memoize the refresh control to prevent recreation
  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={status === 'loading' && list.length === 0}
        onRefresh={onRefresh}
        colors={[theme.colors.primary]}
        tintColor={theme.colors.primary}
      />
    ),
    [status, list.length, onRefresh, theme.colors.primary],
  );

  // Memoize the animated value to prevent recreation
  const resultCountScale = useMemo(() => new Animated.Value(0), []);

  // Memoize the footer component to prevent unnecessary re-renders
  const footerComponent = useMemo(() => {
    if (status === 'loading' && list.length > 0) {
      return (
        <View
          style={[styles.footer, { backgroundColor: theme.colors.surface }]}
        >
          <ShimmerText width="60%" height={16} />
        </View>
      );
    }

    if (!pagination.next_url && list.length > 0) {
      return (
        <View
          style={[styles.footer, { backgroundColor: theme.colors.surface }]}
        >
          <Text
            style={[
              styles.footerText,
              {
                color: theme.colors.onSurfaceVariant,
                textAlign: textAlign as any,
              },
            ]}
          >
            {list.length === 1
              ? '1 result found'
              : `${list.length} results found`}
          </Text>
          <Text
            style={[
              styles.footerSubtext,
              {
                color: theme.colors.onSurfaceVariant,
                textAlign: textAlign as any,
              },
            ]}
          >
            No more results available
          </Text>
        </View>
      );
    }

    if (pagination.next_url && list.length > 0) {
      return (
        <View
          style={[styles.footer, { backgroundColor: theme.colors.surface }]}
        >
          <Text
            style={[
              styles.footerText,
              {
                color: theme.colors.onSurfaceVariant,
                textAlign: textAlign as any,
              },
            ]}
          >
            {list.length === 1
              ? '1 result found'
              : `${list.length} results found`}
          </Text>
          <Text
            style={[
              styles.footerSubtext,
              {
                color: theme.colors.onSurfaceVariant,
                textAlign: textAlign as any,
              },
            ]}
          >
            Scroll down for more results
          </Text>
        </View>
      );
    }

    if (list.length === 0 && status === 'idle') {
      return (
        <View
          style={[styles.footer, { backgroundColor: theme.colors.surface }]}
        >
          <Text
            style={[
              styles.footerText,
              {
                color: theme.colors.onSurfaceVariant,
                textAlign: textAlign as any,
              },
            ]}
          >
            No results found
          </Text>
        </View>
      );
    }

    return null;
  }, [
    status,
    pagination.next_url,
    list.length,
    theme.colors.surface,
    theme.colors.onSurfaceVariant,
    textAlign,
  ]);

  // Memoize the renderItem function to prevent unnecessary re-renders
  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <StockItem ticker={item.ticker} name={item.name} stock={item as any} />
    ),
    [],
  );

  // Memoize the keyExtractor function
  const keyExtractor = useCallback((item: any) => `${item.ticker}`, []);

  // Memoize the onEndReached function
  const onEndReached = useCallback(() => {
    // Only load more if we're not already loading and have a next URL
    if (status === 'idle' && pagination.next_url) {
      loadMore();
    }
  }, [status, pagination.next_url, loadMore]);

  // Memoize the content container style
  const contentContainerStyle = useMemo(
    () => [styles.contentContainer, { paddingBottom: 20 }],
    [],
  );

  // Memoize the container style
  const containerStyle = useMemo(
    () => [styles.container, { backgroundColor: theme.colors.background }],
    [theme.colors.background],
  );

  if (status === 'loading' && list.length === 0) {
    return (
      <View style={containerStyle}>
        <InitialShimmerList count={15} />
      </View>
    );
  }

  // Handle empty list state
  if (status === 'idle' && list.length === 0) {
    return (
      <View style={containerStyle}>
        <View style={styles.emptyContainer}>
          <Text
            style={[
              styles.emptyTitle,
              {
                color: theme.colors.onSurfaceVariant,
                textAlign: textAlign as any,
              },
            ]}
          >
            {t('explore.noResults')}
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              {
                color: theme.colors.onSurfaceVariant,
                textAlign: textAlign as any,
              },
            ]}
          >
            {t('explore.noResultsSubtitle')}
          </Text>
        </View>
      </View>
    );
  }

  // Handle error state - show error message in center
  if (status === 'error' && error) {
    // Show shimmer loading when retrying
    if (isRetrying) {
      return (
        <View style={containerStyle}>
          <InitialShimmerList count={15} />
        </View>
      );
    }

    return (
      <View style={containerStyle}>
        <View style={styles.errorContainer}>
          <Text
            style={[
              styles.errorTitle,
              {
                color: theme.colors.error,
                textAlign: 'center',
              },
            ]}
          >
            {t('common.error')}
          </Text>
          <Text
            style={[
              styles.errorMessage,
              {
                color: theme.colors.onSurfaceVariant,
                textAlign: 'center',
              },
            ]}
          >
            {error}
          </Text>
          {errorDetails?.isRetryable && (
            <Button
              mode="contained"
              onPress={() => {
                // Retry immediately without delays
                setIsRetrying(true); // Show shimmer loading
                if (pagination.next_url) {
                  dispatch(
                    fetchStocks({ filters, next_url: pagination.next_url }),
                  );
                } else {
                  dispatch(fetchStocks({ filters }));
                }
              }}
              style={styles.retryButton}
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
            >
              {t('common.retry')}
            </Button>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <FlatList
        data={list}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onEndReachedThreshold={0.2}
        onEndReached={onEndReached}
        ListFooterComponent={footerComponent}
        refreshControl={refreshControl}
        contentContainerStyle={contentContainerStyle}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300, // Ensure minimum height for proper centering
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    width: '100%',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    width: '100%',
    paddingHorizontal: 20,
  },
  retryButton: {
    width: '80%',
    marginTop: 8,
  },
});

export default StockList;
