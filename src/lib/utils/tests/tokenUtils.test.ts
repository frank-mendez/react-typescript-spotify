import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the auth service first
vi.mock('../../auth/auth.service', () => ({
  getRefreshToken: vi.fn(),
}));

import { getValidAccessToken, debugTokenInfo } from '../tokenUtils';
import { getRefreshToken } from '../../auth/auth.service';

const mockGetRefreshToken = vi.mocked(getRefreshToken);

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock console methods
const mockConsole = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

Object.defineProperty(window, 'console', {
  value: mockConsole,
});

describe('tokenUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRefreshToken.mockClear();
  });

  describe('getValidAccessToken', () => {
    it('returns null when no access token is stored', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = await getValidAccessToken();

      expect(result).toBeNull();
    });

    it('returns token when it is still valid', async () => {
      const futureTime = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'access_token') return 'valid-token';
        if (key === 'expires') return futureTime;
        return null;
      });

      const result = await getValidAccessToken();

      expect(result).toBe('valid-token');
    });

    it('returns null when token is expired and no refresh token available', async () => {
      const pastTime = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'access_token') return 'expired-token';
        if (key === 'expires') return pastTime;
        if (key === 'refresh_token') return null;
        return null;
      });

      const result = await getValidAccessToken();

      expect(result).toBeNull();
      expect(mockConsole.log).toHaveBeenCalledWith('Token expired, attempting to refresh...');
    });

    it('attempts to refresh token when expired and refresh token is available', async () => {
      const pastTime = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'access_token') return 'expired-token';
        if (key === 'expires') return pastTime;
        if (key === 'refresh_token') return 'refresh-token';
        return null;
      });

      mockGetRefreshToken.mockResolvedValueOnce({
        access_token: 'new-token',
        expires_in: 3600,
        refresh_token: 'new-refresh-token',
      });

      const result = await getValidAccessToken();

      expect(result).toBe('new-token');
      expect(mockGetRefreshToken).toHaveBeenCalledWith('refresh-token');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', 'new-token');
    });

    it('handles refresh token failure', async () => {
      const pastTime = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'access_token') return 'expired-token';
        if (key === 'expires') return pastTime;
        if (key === 'refresh_token') return 'refresh-token';
        return null;
      });

      mockGetRefreshToken.mockRejectedValueOnce(new Error('Unauthorized'));

      const result = await getValidAccessToken();

      expect(result).toBeNull();
      expect(mockConsole.error).toHaveBeenCalledWith('Failed to refresh token:', expect.any(Error));
    });
  });

  describe('debugTokenInfo', () => {
    it('logs token information when all data is available', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'access_token') return 'test-token';
        if (key === 'refresh_token') return 'test-refresh';
        if (key === 'expires') return '2024-01-01T12:00:00.000Z';
        if (key === 'expires_in') return '3600';
        return null;
      });

      debugTokenInfo();

      expect(mockConsole.log).toHaveBeenCalledWith('=== TOKEN DEBUG INFO ===');
      expect(mockConsole.log).toHaveBeenCalledWith('Access Token:', 'test-token...');
      expect(mockConsole.log).toHaveBeenCalledWith('Refresh Token:', 'test-refresh...');
      expect(mockConsole.log).toHaveBeenCalledWith('Expires:', '2024-01-01T12:00:00.000Z');
      expect(mockConsole.log).toHaveBeenCalledWith('Expires In:', '3600');
      expect(mockConsole.log).toHaveBeenCalledWith('Is Expired:', expect.any(Boolean));
      expect(mockConsole.log).toHaveBeenCalledWith('Current Time:', expect.any(String));
      expect(mockConsole.log).toHaveBeenCalledWith('========================');
    });

    it('logs null values when data is not available', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      debugTokenInfo();

      expect(mockConsole.log).toHaveBeenCalledWith('=== TOKEN DEBUG INFO ===');
      expect(mockConsole.log).toHaveBeenCalledWith('Access Token:', 'None');
      expect(mockConsole.log).toHaveBeenCalledWith('Refresh Token:', 'None');
      expect(mockConsole.log).toHaveBeenCalledWith('Expires:', null);
      expect(mockConsole.log).toHaveBeenCalledWith('Expires In:', null);
      expect(mockConsole.log).toHaveBeenCalledWith('Is Expired:', expect.any(Boolean));
      expect(mockConsole.log).toHaveBeenCalledWith('Current Time:', expect.any(String));
      expect(mockConsole.log).toHaveBeenCalledWith('========================');
    });
  });
});
