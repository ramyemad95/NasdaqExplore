import { POLYGON_BASE_URL, TICKERS_ENDPOINT } from '../../src/utils/constants';

describe('Constants', () => {
  describe('API URLs', () => {
    it('should have correct polygon base URL', () => {
      expect(POLYGON_BASE_URL).toBe('https://api.polygon.io');
    });

    it('should have correct tickers endpoint', () => {
      expect(TICKERS_ENDPOINT).toBe('/v3/reference/tickers');
    });

    it('should export string constants', () => {
      expect(typeof POLYGON_BASE_URL).toBe('string');
      expect(typeof TICKERS_ENDPOINT).toBe('string');
    });

    it('should have non-empty values', () => {
      expect(POLYGON_BASE_URL).toBeTruthy();
      expect(TICKERS_ENDPOINT).toBeTruthy();
    });

    it('should have valid URL format for base URL', () => {
      expect(POLYGON_BASE_URL).toMatch(/^https?:\/\//);
    });

    it('should have valid endpoint path format', () => {
      expect(TICKERS_ENDPOINT).toMatch(/^\/.*$/);
    });
  });
});
