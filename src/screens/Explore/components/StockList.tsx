import React, { useCallback, useMemo, useEffect } from 'react';
import { View, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useTheme, Text, Button } from 'react-native-paper';
import StockItem from '../../../components/StockItem';
import {
  ShimmerList,
  ShimmerText,
  InitialShimmerList,
} from '../../../components/Shimmer';
import { useRTL } from '../../../hooks/useRTL';
import { useTranslation } from 'react-i18next';
import { Animated } from 'react-native';
import { useStocks } from '../../../hooks/useStocks';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { StockFilters, BaseComponentProps } from '../../../utils/types';

const StockList: React.FC = React.memo(() => {
  const theme = useTheme();
  const { textAlign } = useRTL();
  const { t } = useTranslation();

  // Use the new useStocks hook
  const {
    stocks,
    isLoading,
    hasError,
    error,
    errorDetails,
    hasMoreStocks,
    paginationUrl,
    searchStocks,
    loadMoreStocks,
    resetStocks,
  } = useStocks();

  // Performance monitoring

  // Get filters from Redux (keeping this for now since filters aren't in useStocks yet)
  const filters = useSelector((state: RootState) => state.filters);

  // Local loading state for retry operations
  const [isRetrying, setIsRetrying] = React.useState(false);

  // Reset retry loading state when status changes
  useEffect(() => {
    if (!isLoading) {
      setIsRetrying(false);
    }
  }, [isLoading]);

  // Memoize filters string to prevent unnecessary API calls
  const filtersString = useMemo(() => JSON.stringify(filters), [filters]);

  // Memoize the loadMore function to prevent unnecessary re-renders
  const loadMore = useCallback(() => {
    if (isLoading || !hasMoreStocks || !paginationUrl) {
      return;
    }
    loadMoreStocks(paginationUrl);
  }, [isLoading, hasMoreStocks, paginationUrl, loadMoreStocks]);

  // Memoize the onRefresh function
  const onRefresh = useCallback(() => {
    searchStocks('', filters);
  }, [searchStocks, filtersString]);

  // Memoize the refresh control to prevent recreation
  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isLoading && stocks.length === 0}
        onRefresh={onRefresh}
        colors={[theme.colors.primary]}
        tintColor={theme.colors.primary}
      />
    ),
    [isLoading, stocks.length, onRefresh, theme.colors.primary],
  );

  // Memoize the animated value to prevent recreation
  const resultCountScale = useMemo(() => new Animated.Value(0), []);

  // Memoize the footer component to prevent unnecessary re-renders
  const footerComponent = useMemo(() => {
    if (isLoading && stocks.length > 0) {
      return (
        <View
          style={[styles.footer, { backgroundColor: theme.colors.surface }]}
        >
          <ShimmerText width="60%" height={16} />
        </View>
      );
    }

    if (!hasMoreStocks && stocks.length > 0) {
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
            {stocks.length === 1
              ? '1 result found'
              : `${stocks.length} results found`}
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

    if (hasMoreStocks && stocks.length > 0) {
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
            {stocks.length === 1
              ? '1 result found'
              : `${stocks.length} results found`}
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

    if (stocks.length === 0 && !isLoading) {
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
    isLoading,
    hasMoreStocks,
    stocks.length,
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
    // Only load more if we're not already loading and have more stocks
    if (!isLoading && hasMoreStocks) {
      loadMore();
    }
  }, [isLoading, hasMoreStocks, loadMore]);

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

  if (isLoading && stocks.length === 0) {
    return (
      <View style={containerStyle}>
        <InitialShimmerList count={15} />
      </View>
    );
  }
  // Handle error state - show error message in center
  if (hasError) {
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
                searchStocks('', filters);
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
  // Handle empty list state
  if (!isLoading && stocks.length === 0) {
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

  return (
    <View style={containerStyle}>
      <FlatList
        data={stocks}
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
