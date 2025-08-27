import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStocks, reset } from '../store/stocksSlice';
import { RootState, AppDispatch } from '../store';

export const useStocks = () => {
  const dispatch = useDispatch<AppDispatch>();
  const stocks = useSelector((state: RootState) => state.stocks);

  const searchStocks = useCallback(
    (search?: string, filters?: any) => {
      dispatch(fetchStocks({ search, filters }));
    },
    [dispatch],
  );

  const loadMoreStocks = useCallback(
    (nextUrl: string) => {
      dispatch(fetchStocks({ next_url: nextUrl }));
    },
    [dispatch],
  );

  const resetStocks = useCallback(() => {
    dispatch(reset());
  }, [dispatch]);

  const isLoading = stocks.status === 'loading';
  const hasError = stocks.status === 'error';
  const hasMoreStocks = !!stocks.pagination?.next_url;
  const paginationUrl = stocks.pagination?.next_url;

  return {
    stocks: stocks.list || [],
    isLoading,
    hasError,
    error: stocks.error,
    errorDetails: stocks.errorDetails,
    hasMoreStocks,
    paginationUrl,
    searchStocks,
    loadMoreStocks,
    resetStocks,
  };
};

export default useStocks;
