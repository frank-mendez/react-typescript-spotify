import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getValidAccessToken } from '../utils/tokenUtils';

const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';

export class SpotifyApiClient {
  private readonly api: AxiosInstance;

  constructor(accessToken: string) {
    this.api = axios.create({
      baseURL: SPOTIFY_BASE_URL,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor to handle 401 errors and token refresh
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          console.log('API returned 401, attempting to refresh token...');
          const newAccessToken = await getValidAccessToken();
          
          if (newAccessToken) {
            console.log('Token refreshed successfully');
            this.updateToken(newAccessToken);
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return this.api(originalRequest);
          } else {
            console.log('Token refresh failed, redirecting to login...');
            // Redirect to login or emit an event for the app to handle
            window.location.href = '/login';
          }
        }
        
        throw error;
      }
    );
  }

  updateToken(accessToken: string) {
    this.api.defaults.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Generic GET method
  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.api.get<T>(endpoint, { params });
    return response.data;
  }

  // Generic POST method
  async post<T, D = unknown>(endpoint: string, data?: D, config?: Record<string, unknown>): Promise<T> {
    const response = await this.api.post<T>(endpoint, data, config);
    return response.data;
  }

  // Generic PUT method
  async put<T, D = unknown>(endpoint: string, data?: D, config?: Record<string, unknown>): Promise<T> {
    const response = await this.api.put<T>(endpoint, data, config);
    return response.data;
  }

  // Generic DELETE method
  async delete<T, D = unknown>(endpoint: string, data?: D): Promise<T> {
    const config = data ? { data } : {};
    const response = await this.api.delete<T>(endpoint, config);
    return response.data;
  }
}
