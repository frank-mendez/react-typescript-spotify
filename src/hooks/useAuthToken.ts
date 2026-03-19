import { useState, useEffect, useCallback } from 'react';
import { getValidAccessToken, debugTokenInfo, isTokenExpired } from '../lib/utils/tokenUtils';
import { redirectToSpotifyAuthorize } from '../lib/auth/auth.service';

export const useAuthToken = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshToken = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Attempting to get valid access token...');
      const validToken = await getValidAccessToken();
      
      if (validToken) {
        setAccessToken(validToken);
        console.log('✅ Valid token obtained');
        debugTokenInfo();
      } else {
        setAccessToken(null);
        setError('No valid token available');
        console.log('❌ No valid token available');
      }
    } catch (err) {
      console.error('Error getting valid token:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forceRefresh = useCallback(async () => {
    // Clear current token and force a refresh
    setAccessToken(null);
    await refreshToken();
  }, [refreshToken]);

  const login = useCallback(async () => {
    try {
      await redirectToSpotifyAuthorize();
    } catch (err) {
      console.error('Error during login redirect:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_in');
    localStorage.removeItem('expires');
    setAccessToken(null);
    setError(null);
  }, []);

  // Initial token check and periodic refresh
  useEffect(() => {
    refreshToken();
    
    // Set up periodic token validation (every 30 seconds)
    const interval = setInterval(() => {
      if (accessToken && isTokenExpired()) {
        console.log('Token expired, refreshing...');
        refreshToken();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshToken, accessToken]);

  // Listen for storage changes (token updates in other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        console.log('Access token changed in storage');
        refreshToken();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshToken]);

  return {
    accessToken,
    isLoading,
    error,
    refreshToken,
    forceRefresh,
    login,
    logout,
    isAuthenticated: !!accessToken,
    hasValidToken: !!accessToken && !isTokenExpired()
  };
};
