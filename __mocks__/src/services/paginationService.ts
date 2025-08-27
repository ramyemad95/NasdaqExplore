export const paginationService = {
  isNewSearch: jest.fn(),
  updateStateForNewSearch: jest.fn(),
  updateStateForPagination: jest.fn(),
  hasMoreItems: jest.fn(),
  getNextPageUrl: jest.fn(),
  mergeItemsWithoutDuplicates: jest.fn(),
  shouldLoadMore: jest.fn(),
  validatePaginationParams: jest.fn(),
  createPaginationState: jest.fn(),
  resetPagination: jest.fn(),
  updateConfig: jest.fn(),
  getConfig: jest.fn(),
};

export default paginationService;
