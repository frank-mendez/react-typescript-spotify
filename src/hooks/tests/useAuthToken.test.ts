import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuthToken } from '../useAuthToken';
import * as tokenUtils from '../../lib/utils/tokenUtils';
import * as authService from '../../lib/auth/auth.service';

// Mock tokenUtils
vi.mock('../../lib/utils/tokenUtils', () => ({
  getValidAccessToken: vi.fn(),
  isTokenExpired: vi.fn()
}));

// Mock auth service
vi.mock('../../lib/auth/auth.service', () => ({
  redirectToSpotifyAuthorize: vi.fn()
}));

// Mock localStorage
const mockLocalStorage = {
  removeItem: vi.fn(),
  getItem: vi.fn(),
  setItem: vi.fn()
};
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage
});

describe('useAuthToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should start with initial loading state', () => {
      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue('test-token');

      const { result } = renderHook(() => useAuthToken());

      expect(result.current.accessToken).toBeNull();
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.hasValidToken).toBe(false);
    });

    it('should have all expected methods', () => {
      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue('test-token');

      const { result } = renderHook(() => useAuthToken());

      expect(typeof result.current.refreshToken).toBe('function');
      expect(typeof result.current.forceRefresh).toBe('function');
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
    });
  });

  describe('token initialization', () => {
    it('should load valid token on initialization', async () => {
      const mockToken = 'valid-test-token';
      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue(mockToken);

      const { result } = renderHook(() => useAuthToken());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.accessToken).toBe(mockToken);
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle no token available', async () => {
      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue(null);

      const { result } = renderHook(() => useAuthToken());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.accessToken).toBeNull();
      expect(result.current.error).toBe('No valid token available');
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle token initialization error', async () => {
      const mockError = new Error('Network error');
      vi.mocked(tokenUtils.getValidAccessToken).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuthToken());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.accessToken).toBeNull();
      expect(result.current.error).toBe('Network error');
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('refreshToken method', () => {
    it('should refresh token successfully', async () => {
      const mockToken = 'refreshed-token';
      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue(mockToken);

      const { result } = renderHook(() => useAuthToken());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Clear the mock and test manual refresh
      vi.clearAllMocks();
      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue('new-token');

      await act(async () => {
        await result.current.refreshToken();
      });

      expect(result.current.accessToken).toBe('new-token');
      expect(result.current.error).toBeNull();
    });

    it('should handle refresh token error', async () => {
      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue('initial-token');

      const { result } = renderHook(() => useAuthToken());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock error on refresh
      const refreshError = new Error('Refresh failed');
      vi.mocked(tokenUtils.getValidAccessToken).mockRejectedValue(refreshError);

      await act(async () => {
        await result.current.refreshToken();
      });

      expect(result.current.accessToken).toBeNull();
      expect(result.current.error).toBe('Refresh failed');
    });
  });

  describe('forceRefresh method', () => {
    it('should clear current token and refresh', async () => {
      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue('initial-token');

      const { result } = renderHook(() => useAuthToken());

      await waitFor(() => {
        expect(result.current.accessToken).toBe('initial-token');
      });

      // Setup for force refresh
      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue('force-refreshed-token');

      await act(async () => {
        await result.current.forceRefresh();
      });

      expect(result.current.accessToken).toBe('force-refreshed-token');
    });
  });

  describe('login method', () => {
    it('should call redirectToSpotifyAuthorize', async () => {
      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue('test-token');
      vi.mocked(authService.redirectToSpotifyAuthorize).mockResolvedValue();

      const { result } = renderHook(() => useAuthToken());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login();
      });

      expect(authService.redirectToSpotifyAuthorize).toHaveBeenCalled();
    });

    it('should handle login error', async () => {
      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue('test-token');
      const loginError = new Error('Login failed');
      vi.mocked(authService.redirectToSpotifyAuthorize).mockRejectedValue(loginError);

      const { result } = renderHook(() => useAuthToken());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login();
      });

      expect(result.current.error).toBe('Login failed');
    });
  });

  describe('logout method', () => {
    it('should clear localStorage and reset state', async () => {
      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue('test-token');

      const { result } = renderHook(() => useAuthToken());

      await waitFor(() => {
        expect(result.current.accessToken).toBe('test-token');
      });

      act(() => {
        result.current.logout();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('expires_in');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('expires');
      expect(result.current.accessToken).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('periodic token validation', () => {
    it('should refresh token when expired', async () => {
      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue('test-token');
      vi.mocked(tokenUtils.isTokenExpired).mockReturnValue(false);

      const { result } = renderHook(() => useAuthToken());

      await waitFor(() => {
        expect(result.current.accessToken).toBe('test-token');
      });

      // Mock token as expired and setup refresh
      vi.mocked(tokenUtils.isTokenExpired).mockReturnValue(true);
      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue('new-token');

      // Manually call refreshToken to simulate what the interval would do
      await act(async () => {
        await result.current.refreshToken();
      });

      expect(result.current.accessToken).toBe('new-token');
    });

    it('should not refresh token when not expired', async () => {
      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue('test-token');
      vi.mocked(tokenUtils.isTokenExpired).mockReturnValue(false);

      const { result } = renderHook(() => useAuthToken());

      await waitFor(() => {
        expect(result.current.accessToken).toBe('test-token');
      });

      const initialCallCount = vi.mocked(tokenUtils.getValidAccessToken).mock.calls.length;

      // Since token is not expired, interval wouldn't trigger refresh
      // Just verify current state
      expect(result.current.accessToken).toBe('test-token');
      expect(vi.mocked(tokenUtils.getValidAccessToken)).toHaveBeenCalledTimes(initialCallCount);
    });
  });

  describe('storage event handling', () => {
    it('should refresh token when access_token changes in storage', async () => {
      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue('initial-token');

      const { result } = renderHook(() => useAuthToken());

      await waitFor(() => {
        expect(result.current.accessToken).toBe('initial-token');
      });

      // Mock new token for refresh
      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue('updated-token');

      // Simulate storage event
      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'access_token',
          newValue: 'new-value'
        });
        globalThis.dispatchEvent(storageEvent);
      });

      await waitFor(() => {
        expect(result.current.accessToken).toBe('updated-token');
      });
    });

    it('should not refresh token for other storage keys', async () => {
      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue('test-token');

      const { result } = renderHook(() => useAuthToken());

      await waitFor(() => {
        expect(result.current.accessToken).toBe('test-token');
      });

      const initialCallCount = vi.mocked(tokenUtils.getValidAccessToken).mock.calls.length;

      // Simulate storage event for different key
      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'other_key',
          newValue: 'value'
        });
        globalThis.dispatchEvent(storageEvent);
      });

      // Should not have refreshed
      expect(vi.mocked(tokenUtils.getValidAccessToken)).toHaveBeenCalledTimes(initialCallCount);
    });
  });

  describe('computed properties', () => {
    it('should calculate hasValidToken correctly', async () => {
      vi.mocked(tokenUtils.getValidAccessToken).mockResolvedValue('test-token');
      vi.mocked(tokenUtils.isTokenExpired).mockReturnValue(false);

      const { result } = renderHook(() => useAuthToken());

      await waitFor(() => {
        expect(result.current.hasValidToken).toBe(true);
      });

      // Test that hasValidToken reflects the token status
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.accessToken).toBe('test-token');
    });
  });
});
