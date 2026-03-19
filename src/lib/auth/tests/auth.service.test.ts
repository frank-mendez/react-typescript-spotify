import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  redirectToSpotifyAuthorize,
  getToken
} from '../auth.service';

// Mock crypto API
const mockCrypto = {
  getRandomValues: vi.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
  subtle: {
    digest: vi.fn(),
  },
};

Object.defineProperty(window, 'crypto', {
  value: mockCrypto,
});

// Mock TextEncoder
global.TextEncoder = vi.fn().mockImplementation(() => ({
  encode: vi.fn((str: string) => new Uint8Array(str.split('').map((c: string) => c.charCodeAt(0)))),
}));

// Mock btoa
global.btoa = vi.fn((str) => Buffer.from(str, 'binary').toString('base64'));

// Mock window.location
const mockLocation = {
  href: '',
  assign: vi.fn(),
  replace: vi.fn(),
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock fetch
global.fetch = vi.fn();

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = '';
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => { });
    mockLocalStorage.removeItem.mockImplementation(() => { });
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  describe('redirectToSpotifyAuthorize', () => {
    it('redirects to Spotify authorization URL', async () => {
      mockCrypto.subtle.digest.mockResolvedValue(new ArrayBuffer(32));
      (global.btoa as any).mockReturnValue('mock-code-challenge');

      await redirectToSpotifyAuthorize();

      expect(mockLocation.href).toContain('https://accounts.spotify.com/authorize');
      expect(mockLocation.href).toContain('client_id=');
      expect(mockLocation.href).toContain('response_type=code');
      expect(mockLocation.href).toContain('redirect_uri=');
      expect(mockLocation.href).toContain('code_challenge_method=S256');
      expect(mockLocation.href).toContain('scope=');
    });

    it('stores code verifier in localStorage', async () => {
      mockCrypto.subtle.digest.mockResolvedValue(new ArrayBuffer(32));
      (global.btoa as any).mockReturnValue('mock-code-challenge');

      await redirectToSpotifyAuthorize();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'code_verifier',
        expect.any(String)
      );
    });

    it('handles crypto digest errors gracefully', async () => {
      mockCrypto.subtle.digest.mockRejectedValue(new Error('Crypto error'));

      // The function should throw when crypto fails
      await expect(redirectToSpotifyAuthorize()).rejects.toThrow('Crypto error');
    }); it('includes all required OAuth parameters', async () => {
      mockCrypto.subtle.digest.mockResolvedValue(new ArrayBuffer(32));
      (global.btoa as any).mockReturnValue('test-challenge');

      await redirectToSpotifyAuthorize();

      const url = new URL(mockLocation.href);

      expect(url.searchParams.get('response_type')).toBe('code');
      expect(url.searchParams.get('client_id')).toBeDefined();
      expect(url.searchParams.get('scope')).toBeDefined();
      expect(url.searchParams.get('code_challenge_method')).toBe('S256');
      expect(url.searchParams.get('code_challenge')).toBeDefined();
      expect(url.searchParams.get('redirect_uri')).toBeDefined();
    });

    it('uses correct Spotify authorization endpoint', async () => {
      mockCrypto.subtle.digest.mockResolvedValue(new ArrayBuffer(32));
      (global.btoa as any).mockReturnValue('test-challenge');

      await redirectToSpotifyAuthorize();

      expect(mockLocation.href).toMatch(/^https:\/\/accounts\.spotify\.com\/authorize/);
    });
  });

  describe('getToken', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'code_verifier') return 'test-verifier';
        return null;
      });
    });

    it('exchanges authorization code for tokens', async () => {
      const mockTokenResponse = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      });

      const result = await getToken('auth-code');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: expect.any(URLSearchParams),
        })
      );

      expect(result).toEqual(mockTokenResponse);
    });

    it('throws error when code_verifier is missing', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      await expect(getToken('auth-code')).rejects.toThrow(
        'Code verifier not found in localStorage'
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('handles token exchange API errors', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: () => Promise.resolve('Error details'),
      });

      await expect(getToken('invalid-code')).rejects.toThrow(
        'Failed to fetch token'
      );
    });

    it('handles network errors during token exchange', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      await expect(getToken('auth-code')).rejects.toThrow(
        'Network error'
      );
    });

    it('constructs correct request body', async () => {
      const mockTokenResponse = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      });

      await getToken('auth-code');

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = fetchCall[1].body as URLSearchParams;

      expect(requestBody.get('grant_type')).toBe('authorization_code');
      expect(requestBody.get('code')).toBe('auth-code');
      expect(requestBody.get('redirect_uri')).toBeTruthy();
      expect(requestBody.get('client_id')).toBeTruthy();
      expect(requestBody.get('code_verifier')).toBe('test-verifier');
    });

    it('handles JSON parsing errors', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('JSON parse error')),
      });

      await expect(getToken('auth-code')).rejects.toThrow('JSON parse error');
    });

    it('validates response structure', async () => {
      const mockTokenResponse = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'user-read-private'
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      });

      const result = await getToken('auth-code');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('expires_in');
      expect(result).toHaveProperty('token_type');
      expect(result.access_token).toBe('mock-access-token');
      expect(result.token_type).toBe('Bearer');
    });
  });
});
