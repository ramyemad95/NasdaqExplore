import {
  PaginationService,
  paginationService,
} from '../../src/services/paginationService';
import { PaginationParams, PaginationState } from '../../src/types';

describe('Pagination Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PaginationService.getInstance();
      const instance2 = PaginationService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('isNewSearch', () => {
    it('should return true for different search terms', () => {
      const result = paginationService.isNewSearch(
        'new search',
        'filters',
        'old search',
        'filters',
      );

      expect(result).toBe(true);
    });

    it('should return true for different filters', () => {
      const result = paginationService.isNewSearch(
        'search',
        'new filters',
        'search',
        'old filters',
      );

      expect(result).toBe(true);
    });

    it('should return false for same search and filters', () => {
      const result = paginationService.isNewSearch(
        'search',
        'filters',
        'search',
        'filters',
      );

      expect(result).toBe(false);
    });

    it('should handle undefined previous values', () => {
      const result = paginationService.isNewSearch(
        'search',
        'filters',
        undefined,
        undefined,
      );

      expect(result).toBe(true);
    });
  });

  describe('mergeItemsWithoutDuplicates', () => {
    it('should merge items with ticker property', () => {
      const existingItems = [
        { ticker: 'AAPL', name: 'Apple' },
        { ticker: 'GOOGL', name: 'Google' },
      ];
      const newItems = [
        { ticker: 'MSFT', name: 'Microsoft' },
        { ticker: 'AAPL', name: 'Apple Inc' }, // Duplicate ticker
      ];

      const result = paginationService.mergeItemsWithoutDuplicates(
        existingItems,
        newItems,
      );

      expect(result).toHaveLength(3);
      expect(result.map(item => item.ticker)).toEqual([
        'AAPL',
        'GOOGL',
        'MSFT',
      ]);
    });

    it('should merge items with id property', () => {
      const existingItems = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];
      const newItems = [
        { id: '3', name: 'Item 3' },
        { id: '1', name: 'Item 1 Updated' }, // Duplicate id
      ];

      const result = paginationService.mergeItemsWithoutDuplicates(
        existingItems,
        newItems,
      );

      expect(result).toHaveLength(3);
      expect(result.map(item => item.id)).toEqual(['1', '2', '3']);
    });

    it('should handle empty arrays', () => {
      const result = paginationService.mergeItemsWithoutDuplicates([], []);
      expect(result).toEqual([]);
    });

    it('should handle undefined items', () => {
      const result = paginationService.mergeItemsWithoutDuplicates(
        [{ ticker: 'AAPL' }],
        [{ ticker: undefined }],
      );

      expect(result).toHaveLength(2);
    });
  });

  describe('updateStateForNewSearch', () => {
    it('should update state for new search', () => {
      const currentItems = [{ ticker: 'OLD', name: 'Old Item' }];
      const results = [{ ticker: 'NEW', name: 'New Item' }];
      const currentSearch = 'new search';
      const currentFilters = 'new filters';
      const pagination: PaginationParams = {
        next_url: 'next-page',
        count: 100,
      };

      const result = paginationService.updateStateForNewSearch(
        currentItems,
        results,
        currentSearch,
        currentFilters,
        pagination,
      );

      expect(result.items).toEqual(results);
      expect(result.search).toBe(currentSearch);
      expect(result.filters).toBe(currentFilters);
      expect(result.pagination.hasMore).toBe(true);
      expect(result.pagination.next_url).toBe('next-page');
      expect(result.pagination.count).toBe(100);
    });
  });

  describe('updateStateForPagination', () => {
    it('should update state for pagination', () => {
      const existingItems = [
        { ticker: 'AAPL', name: 'Apple' },
        { ticker: 'GOOGL', name: 'Google' },
      ];
      const newItems = [
        { ticker: 'MSFT', name: 'Microsoft' },
        { ticker: 'TSLA', name: 'Tesla' },
      ];
      const pagination: PaginationParams = {
        next_url: 'next-page',
        count: 200,
      };

      const result = paginationService.updateStateForPagination(
        existingItems,
        newItems,
        pagination,
      );

      expect(result.items).toHaveLength(4);
      expect(result.pagination.hasMore).toBe(true);
      expect(result.pagination.next_url).toBe('next-page');
      expect(result.pagination.count).toBe(200);
    });

    it('should handle pagination without next page', () => {
      const existingItems = [{ ticker: 'AAPL', name: 'Apple' }];
      const newItems = [{ ticker: 'GOOGL', name: 'Google' }];
      const pagination: PaginationParams = {
        count: 100,
      };

      const result = paginationService.updateStateForPagination(
        existingItems,
        newItems,
        pagination,
      );

      expect(result.pagination.hasMore).toBe(false);
      expect(result.pagination.next_url).toBeUndefined();
    });
  });

  describe('hasMoreItems', () => {
    it('should return true when there are more items', () => {
      const pagination: PaginationState = {
        next_url: 'next-page',
        hasMore: true,
      };

      const result = paginationService.hasMoreItems(pagination);

      expect(result).toBe(true);
    });

    it('should return false when no more items', () => {
      const pagination: PaginationState = {
        hasMore: false,
      };

      const result = paginationService.hasMoreItems(pagination);

      expect(result).toBe(false);
    });

    it('should return false when next_url is undefined', () => {
      const pagination: PaginationState = {
        hasMore: true,
        next_url: undefined,
      };

      const result = paginationService.hasMoreItems(pagination);

      expect(result).toBe(false);
    });
  });

  describe('getNextPageUrl', () => {
    it('should return next page URL', () => {
      const pagination: PaginationState = {
        next_url: 'next-page',
        hasMore: true,
      };

      const result = paginationService.getNextPageUrl(pagination);

      expect(result).toBe('next-page');
    });

    it('should return undefined when no next page', () => {
      const pagination: PaginationState = {
        hasMore: false,
      };

      const result = paginationService.getNextPageUrl(pagination);

      expect(result).toBeUndefined();
    });
  });

  describe('shouldLoadMore', () => {
    it('should return true when approaching end of list', () => {
      const result = paginationService.shouldLoadMore(80, 100, 0.2);

      expect(result).toBe(true);
    });

    it('should return false when far from end', () => {
      const result = paginationService.shouldLoadMore(20, 100, 0.2);

      expect(result).toBe(false);
    });

    it('should use default threshold when not specified', () => {
      const result = paginationService.shouldLoadMore(80, 100);

      expect(result).toBe(true);
    });
  });

  describe('validatePaginationParams', () => {
    it('should validate correct parameters', () => {
      const params: PaginationParams = {
        next_url: 'next-page',
        count: 100,
      };

      const result = paginationService.validatePaginationParams(params);

      expect(result).toBe(true);
    });

    it('should reject invalid next_url type', () => {
      const params = {
        next_url: 123, // Invalid type
        count: 100,
      };

      const result = paginationService.validatePaginationParams(params as any);

      expect(result).toBe(false);
    });

    it('should reject negative count', () => {
      const params: PaginationParams = {
        count: -1,
      };

      const result = paginationService.validatePaginationParams(params);

      expect(result).toBe(false);
    });

    it('should accept empty parameters', () => {
      const params: PaginationParams = {};

      const result = paginationService.validatePaginationParams(params);

      expect(result).toBe(true);
    });
  });

  describe('createPaginationState', () => {
    it('should create pagination state from params', () => {
      const params: PaginationParams = {
        next_url: 'next-page',
        count: 100,
      };

      const result = paginationService.createPaginationState(params);

      expect(result).toEqual({
        next_url: 'next-page',
        count: 100,
        hasMore: true,
      });
    });

    it('should handle params without next_url', () => {
      const params: PaginationParams = {
        count: 100,
      };

      const result = paginationService.createPaginationState(params);

      expect(result).toEqual({
        next_url: undefined,
        count: 100,
        hasMore: false,
      });
    });
  });

  describe('resetPagination', () => {
    it('should return reset pagination state', () => {
      const result = paginationService.resetPagination();

      expect(result).toEqual({
        next_url: undefined,
        count: undefined,
        hasMore: false,
      });
    });
  });

  describe('configuration', () => {
    it('should update configuration', () => {
      const newConfig = {
        maxRetries: 5,
        pageSize: 50,
      };

      paginationService.updateConfig(newConfig);

      const config = paginationService.getConfig();
      expect(config.maxRetries).toBe(5);
      expect(config.pageSize).toBe(50);
      expect(config.retryDelay).toBe(1000); // Default value preserved
    });

    it('should get current configuration', () => {
      // Reset to default config first
      paginationService.updateConfig({
        maxRetries: 3,
        retryDelay: 1000,
        pageSize: 100,
      });

      const config = paginationService.getConfig();

      expect(config).toEqual({
        maxRetries: 3,
        retryDelay: 1000,
        pageSize: 100,
      });
    });
  });
});
