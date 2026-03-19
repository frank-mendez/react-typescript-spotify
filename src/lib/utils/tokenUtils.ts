import { getRefreshToken } from '../auth/auth.service';

export const isTokenExpired = (): boolean => {
  const expiresString = localStorage.getItem('expires');
  if (!expiresString) return true;

  const expires = new Date(expiresString);
  const now = new Date();

  // Add 5 minute buffer before expiration
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  return expires <= fiveMinutesFromNow;
};

export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refresh_token');

  if (!refreshToken) {
    return null;
  }

  try {
    const tokenResponse = await getRefreshToken(refreshToken);

    localStorage.setItem('access_token', tokenResponse.access_token);
    localStorage.setItem('expires_in', tokenResponse.expires_in.toString());
    localStorage.setItem(
      'expires',
      new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString()
    );

    // If a new refresh token is provided, update it
    if (tokenResponse.refresh_token) {
      localStorage.setItem('refresh_token', tokenResponse.refresh_token);
    }

    return tokenResponse.access_token;
  } catch (error) {
    // Clear tokens on refresh failure
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_in');
    localStorage.removeItem('expires');
    return null;
  }
};

export const getValidAccessToken = async (): Promise<string | null> => {
  let accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    return null;
  }

  if (isTokenExpired()) {
    accessToken = await refreshAccessToken();
  }

  return accessToken;
};
