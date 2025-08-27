import { PaginationParams, PaginationState } from '../types';

export interface PaginationServiceConfig {
  maxRetries?: number;
  retryDelay?: number;
  pageSize?: number;
}

export class PaginationService {
  private static instance: PaginationService;
  private config: Required<PaginationServiceConfig>;

  private constructor() {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      pageSize: 100,
    };
  }

  static getInstance(): PaginationService {
    if (!PaginationService.instance) {
      PaginationService.instance = new PaginationService();
    }
    return PaginationService.instance;
  }

  /**
   * Check if this is a new search request
   */
  isNewSearch(
    currentSearch: string,
    currentFilters: string,
    lastSearch?: string,
    lastFilters?: string,
  ): boolean {
    return lastSearch !== currentSearch || lastFilters !== currentFilters;
  }

  /**
   * Merge new items with existing items, removing duplicates
   */
  mergeItemsWithoutDuplicates<T extends { ticker?: string; id?: string }>(
    existingItems: T[],
    newItems: T[],
  ): T[] {
    const combined = [...existingItems, ...newItems];
    const seenKeys = new Set<string>();

    return combined.filter((item: T) => {
      const key = item?.ticker ?? item?.id ?? '';
      if (seenKeys.has(key)) {
        return false;
      }
      seenKeys.add(key);
      return true;
    });
  }

  /**
   * Update pagination state for new search
   */
  updateStateForNewSearch<T>(
    currentItems: T[],
    results: T[],
    currentSearch: string,
    currentFilters: string,
    pagination: PaginationParams,
  ): {
    items: T[];
    search: string;
    filters: string;
    pagination: PaginationState;
  } {
    return {
      items: results,
      search: currentSearch,
      filters: currentFilters,
      pagination: {
        next_url: pagination.next_url,
        count: pagination.count,
        hasMore: !!pagination.next_url,
      },
    };
  }

  /**
   * Update pagination state for pagination requests
   */
  updateStateForPagination<T>(
    existingItems: T[],
    newItems: T[],
    pagination: PaginationParams,
  ): {
    items: T[];
    pagination: PaginationState;
  } {
    const mergedItems = this.mergeItemsWithoutDuplicates(
      existingItems,
      newItems,
    );

    return {
      items: mergedItems,
      pagination: {
        next_url: pagination.next_url,
        count: pagination.count,
        hasMore: !!pagination.next_url,
      },
    };
  }

  /**
   * Check if there are more items to load
   */
  hasMoreItems(pagination: PaginationState): boolean {
    return pagination.hasMore && !!pagination.next_url;
  }

  /**
   * Get the next page URL
   */
  getNextPageUrl(pagination: PaginationState): string | undefined {
    return pagination.next_url;
  }

  /**
   * Calculate if we should load more items
   */
  shouldLoadMore(
    currentIndex: number,
    totalItems: number,
    threshold: number = 0.2,
  ): boolean {
    const remainingItems = totalItems - currentIndex;
    const thresholdCount = Math.floor(totalItems * threshold);
    return remainingItems <= thresholdCount;
  }

  /**
   * Validate pagination parameters
   */
  validatePaginationParams(params: PaginationParams): boolean {
    if (params.next_url && typeof params.next_url !== 'string') {
      return false;
    }
    if (
      params.count &&
      (typeof params.count !== 'number' || params.count < 0)
    ) {
      return false;
    }
    return true;
  }

  /**
   * Create pagination state from API response
   */
  createPaginationState(pagination: PaginationParams): PaginationState {
    return {
      next_url: pagination.next_url,
      count: pagination.count,
      hasMore: !!pagination.next_url,
    };
  }

  /**
   * Reset pagination state
   */
  resetPagination(): PaginationState {
    return {
      next_url: undefined,
      count: undefined,
      hasMore: false,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PaginationServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<PaginationServiceConfig> {
    return { ...this.config };
  }
}

export const paginationService = PaginationService.getInstance();
export default paginationService;
