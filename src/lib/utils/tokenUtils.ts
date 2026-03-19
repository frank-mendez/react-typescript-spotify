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
    console.error('No refresh token available');
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
    console.error('Failed to refresh token:', error);
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
    console.log('Token expired, attempting to refresh...');
    accessToken = await refreshAccessToken();
  }
  
  return accessToken;
};

export const debugTokenInfo = () => {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const expires = localStorage.getItem('expires');
  const expiresIn = localStorage.getItem('expires_in');
  
  console.log('=== TOKEN DEBUG INFO ===');
  console.log('Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'None');
  console.log('Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'None');
  console.log('Expires:', expires);
  console.log('Expires In:', expiresIn);
  console.log('Is Expired:', isTokenExpired());
  console.log('Current Time:', new Date().toISOString());
  console.log('========================');
};
