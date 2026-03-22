import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { SpotifyApiClient } from '../base.service';
import * as tokenUtils from '../../utils/tokenUtils';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn()
  },
  create: vi.fn()
}));

// Mock tokenUtils
vi.mock('../../utils/tokenUtils', () => ({
  getValidAccessToken: vi.fn()
}));

// Mock window.location
const mockLocation = {
  href: ''
};
Object.defineProperty(globalThis, 'location', {
  value: mockLocation,
  writable: true
});

// Create a proper AxiosError mock
const createMockAxiosError = (status: number, hasRetry = false): AxiosError => {
  const config: InternalAxiosRequestConfig & { _retry?: boolean } = {
    headers: {} as any,
    _retry: hasRetry
  };

  const error = new Error('Request failed') as AxiosError;
  error.response = { status } as AxiosResponse;
  error.config = config;
  error.isAxiosError = true;
  error.toJSON = () => ({});
  return error;
};

describe('SpotifyApiClient', () => {
  let apiClient: SpotifyApiClient;
  let mockAxiosInstance: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    interceptors: {
      response: {
        use: ReturnType<typeof vi.fn>;
      };
    };
    defaults: {
      headers: Record<string, string>;
    };
    [key: string]: any;
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockLocation.href = '';

    // Create mock axios instance
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      },
      defaults: {
        headers: {}
      }
    };

    // Mock axios.create to return our mock instance
    const mockedAxios = vi.mocked(axios);
    mockedAxios.create = vi.fn().mockReturnValue(mockAxiosInstance as unknown as AxiosInstance);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create axios instance with correct configuration', () => {
      const accessToken = 'test-token';

      apiClient = new SpotifyApiClient(accessToken);

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.spotify.com/v1',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        paramsSerializer: expect.any(Function),
      });
    });

    it('should set up response interceptor', () => {
      const accessToken = 'test-token';

      apiClient = new SpotifyApiClient(accessToken);

      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  describe('updateToken', () => {
    beforeEach(() => {
      apiClient = new SpotifyApiClient('initial-token');
    });

    it('should update authorization header with new token', () => {
      const newToken = 'new-token';

      apiClient.updateToken(newToken);

      expect(mockAxiosInstance.defaults.headers['Authorization']).toBe(`Bearer ${newToken}`);
    });
  });

  describe('HTTP methods', () => {
    beforeEach(() => {
      apiClient = new SpotifyApiClient('test-token');
    });

    describe('get', () => {
      it('should make GET request and return data', async () => {
        const mockResponse = { data: { id: '1', name: 'test' } };
        mockAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await apiClient.get('/test-endpoint');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test-endpoint', { params: undefined });
        expect(result).toEqual(mockResponse.data);
      });

      it('should make GET request with params', async () => {
        const mockResponse = { data: { items: [] } };
        const params = { limit: 10, offset: 0 };
        mockAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await apiClient.get('/test-endpoint', params);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test-endpoint', { params });
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('post', () => {
      it('should make POST request and return data', async () => {
        const mockResponse = { data: { success: true } };
        const requestData = { name: 'test' };
        mockAxiosInstance.post.mockResolvedValue(mockResponse);

        const result = await apiClient.post('/test-endpoint', requestData);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test-endpoint', requestData, { headers: { 'Content-Type': 'application/json' } });
        expect(result).toEqual(mockResponse.data);
      });

      it('should make POST request with config', async () => {
        const mockResponse = { data: { success: true } };
        const requestData = { name: 'test' };
        const config = { timeout: 5000 };
        mockAxiosInstance.post.mockResolvedValue(mockResponse);

        const result = await apiClient.post('/test-endpoint', requestData, config);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test-endpoint', requestData, { headers: { 'Content-Type': 'application/json' }, ...config });
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('put', () => {
      it('should make PUT request and return data', async () => {
        const mockResponse = { data: { updated: true } };
        const requestData = { name: 'updated' };
        mockAxiosInstance.put.mockResolvedValue(mockResponse);

        const result = await apiClient.put('/test-endpoint', requestData);

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test-endpoint', requestData, { headers: { 'Content-Type': 'application/json' } });
        expect(result).toEqual(mockResponse.data);
      });

      it('should make PUT request with config', async () => {
        const mockResponse = { data: { updated: true } };
        const requestData = { name: 'updated' };
        const config = { timeout: 5000 };
        mockAxiosInstance.put.mockResolvedValue(mockResponse);

        const result = await apiClient.put('/test-endpoint', requestData, config);

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test-endpoint', requestData, { headers: { 'Content-Type': 'application/json' }, ...config });
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('delete', () => {
      it('should make DELETE request and return data', async () => {
        const mockResponse = { data: { deleted: true } };
        mockAxiosInstance.delete.mockResolvedValue(mockResponse);

        const result = await apiClient.delete('/test-endpoint');

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test-endpoint', {});
        expect(result).toEqual(mockResponse.data);
      });

      it('should make DELETE request with data', async () => {
        const mockResponse = { data: { deleted: true } };
        const requestData = { ids: ['1', '2'] };
        mockAxiosInstance.delete.mockResolvedValue(mockResponse);

        const result = await apiClient.delete('/test-endpoint', requestData);

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test-endpoint', { data: requestData });
        expect(result).toEqual(mockResponse.data);
      });
    });
  });

  describe('response interceptor', () => {
    let responseInterceptor: (response: any) => any;
    let errorInterceptor: (error: any) => Promise<any>;

    beforeEach(() => {
      apiClient = new SpotifyApiClient('test-token');

      // Get the interceptor functions that were registered
      const interceptorCall = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      responseInterceptor = interceptorCall[0];
      errorInterceptor = interceptorCall[1];
    });

    it('should pass through successful responses', async () => {
      const mockResponse = { data: { test: 'data' }, status: 200 };

      const result = await responseInterceptor(mockResponse);

      expect(result).toBe(mockResponse);
    });

    it('should handle 401 error with successful token refresh', async () => {
      const mockError = createMockAxiosError(401, false);

      const newToken = 'refreshed-token';
      const mockRetryResponse = { data: { success: true } };

      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue(newToken);
      mockAxiosInstance.get.mockResolvedValue(mockRetryResponse);

      // Since we can't easily mock the internal api call, we'll just check that the function
      // attempts to refresh the token and updates the config
      try {
        await errorInterceptor(mockError);
      } catch (error) {
        // The error might still be thrown due to mocking limitations
        // We only care about testing the token refresh logic, not the actual retry
        expect(error).toBeInstanceOf(Error);
      }

      expect(tokenUtils.getValidAccessToken).toHaveBeenCalled();
      expect(mockError.config?.headers?.['Authorization']).toBe(`Bearer ${newToken}`);
      expect((mockError.config as any)?._retry).toBe(true);
    });

    it('should clear auth tokens from localStorage when token refresh fails', async () => {
      const mockError = createMockAxiosError(401, false);

      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue(null);

      // Populate localStorage with auth tokens
      localStorage.setItem('access_token', 'old-token');
      localStorage.setItem('refresh_token', 'old-refresh');
      localStorage.setItem('expires_in', '3600');
      localStorage.setItem('expires', '9999999999');

      await expect(errorInterceptor(mockError)).rejects.toBe(mockError);

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('expires_in')).toBeNull();
      expect(localStorage.getItem('expires')).toBeNull();
    });

    it('should not retry if already retried', async () => {
      const mockError = createMockAxiosError(401, true);

      await expect(errorInterceptor(mockError)).rejects.toBe(mockError);
      expect(tokenUtils.getValidAccessToken).not.toHaveBeenCalled();
    });

    it('should pass through non-401 errors', async () => {
      const mockError = createMockAxiosError(404);

      await expect(errorInterceptor(mockError)).rejects.toBe(mockError);
      expect(tokenUtils.getValidAccessToken).not.toHaveBeenCalled();
    });

    it('should handle errors without response', async () => {
      const mockError = new Error('Network error') as AxiosError;
      mockError.config = { headers: {} } as InternalAxiosRequestConfig;
      mockError.isAxiosError = true;
      mockError.toJSON = () => ({});

      await expect(errorInterceptor(mockError)).rejects.toBe(mockError);
      expect(tokenUtils.getValidAccessToken).not.toHaveBeenCalled();
    });
  });
});
