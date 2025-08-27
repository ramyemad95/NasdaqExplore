import api from '../../src/services/api';

// Silence console logs in interceptors
jest.spyOn(console, 'log').mockImplementation();
jest.spyOn(console, 'error').mockImplementation();

// Mock ErrorManager to avoid complex processing and ensure determinism
jest.mock('../../src/utils/errorManager', () => ({
  __esModule: true,
  default: {
    processApiError: (err: any) => ({
      message: err?.message || 'error',
      isRetryable: false,
      errorType: 'other',
    }),
  },
}));

describe('api retry branch', () => {
  it('retries once when original request exists without __retry flag', async () => {
    const handler = (api.interceptors.response as any).handlers[0].rejected;

    const error: any = new Error('Network');
    error.config = { url: '/x', method: 'GET' };

    const originalAdapter = api.defaults.adapter;
    api.defaults.adapter = jest.fn(() =>
      Promise.resolve({
        data: { ok: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config,
      } as any),
    );

    await expect(handler(error)).resolves.toEqual(
      expect.objectContaining({ data: { ok: true } }),
    );

    // Restore adapter
    api.defaults.adapter = originalAdapter;
  });

  it('enhances error when already retried (__retry=true)', async () => {
    const handler = (api.interceptors.response as any).handlers[0].rejected;
    const err: any = new Error('Boom');
    err.config = { url: '/y', method: 'GET', __retry: true, __retryCount: 1 };

    await expect(handler(err)).rejects.toMatchObject({
      message: 'Boom',
      isRetryable: false,
      errorType: 'other',
      retryCount: 1,
    });
  });
});
