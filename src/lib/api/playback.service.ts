import { SpotifyApiClient } from './base.service';
import { 
  Device,
  PlaybackState,
  CurrentlyPlaying,
  Track
} from '../../data-objects/interface';

export class PlaybackService {
  constructor(private readonly apiClient: SpotifyApiClient) {}

  /**
   * Get information about the user's current playback state, including track or episode, progress, and active device.
   * @param market An ISO 3166-1 alpha-2 country code.
   * @param additionalTypes A comma-separated list of item types that your client supports.
   */
  async getCurrentPlayback(market?: string, additionalTypes?: string): Promise<PlaybackState | null> {
    const params: Record<string, string> = {};
    if (market) params.market = market;
    if (additionalTypes) params.additional_types = additionalTypes;
    
    try {
      return await this.apiClient.get<PlaybackState>('/me/player', params);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && 
          (error as { response: { status: number } }).response?.status === 204) {
        return null; // No active device
      }
      throw error;
    }
  }

  /**
   * Transfer playback to a new device and determine if it should start playing.
   * @param deviceIds Array containing the ID of the device on which playback should be started/transferred.
   * @param play If true, ensure playback happens on new device.
   */
  async transferPlayback(deviceIds: string[], play: boolean = false): Promise<void> {
    return this.apiClient.put('/me/player', {
      device_ids: deviceIds,
      play
    });
  }

  /**
   * Get information about a user's available devices.
   */
  async getAvailableDevices(): Promise<{ devices: Device[] }> {
    return this.apiClient.get<{ devices: Device[] }>('/me/player/devices');
  }

  /**
   * Get the object currently being played on the user's Spotify account.
   * @param market An ISO 3166-1 alpha-2 country code.
   * @param additionalTypes A comma-separated list of item types that your client supports.
   */
  async getCurrentlyPlaying(market?: string, additionalTypes?: string): Promise<CurrentlyPlaying | null> {
    const params: Record<string, string> = {};
    if (market) params.market = market;
    if (additionalTypes) params.additional_types = additionalTypes;
    
    try {
      return await this.apiClient.get<CurrentlyPlaying>('/me/player/currently-playing', params);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && 
          (error as { response: { status: number } }).response?.status === 204) {
        return null; // No track currently playing
      }
      throw error;
    }
  }

  /**
   * Start a new context or resume current playback on the user's active device.
   * @param options Playback options.
   */
  async startResumePlayback(options?: {
    device_id?: string;
    context_uri?: string;
    uris?: string[];
    offset?: { position?: number; uri?: string };
    position_ms?: number;
  }): Promise<void> {
    const endpoint = options?.device_id ? `/me/player/play?device_id=${options.device_id}` : '/me/player/play';
    const body = options ? { ...options } : {};
    delete body.device_id; // Remove device_id from body as it's in query params
    
    return this.apiClient.put(endpoint, Object.keys(body).length > 0 ? body : null);
  }

  /**
   * Pause playback on the user's account.
   * @param deviceId The id of the device this command is targeting.
   */
  async pausePlayback(deviceId?: string): Promise<void> {
    const endpoint = deviceId ? `/me/player/pause?device_id=${deviceId}` : '/me/player/pause';
    return this.apiClient.put(endpoint);
  }

  /**
   * Skips to next track in the user's queue.
   * @param deviceId The id of the device this command is targeting.
   */
  async skipToNext(deviceId?: string): Promise<void> {
    const endpoint = deviceId ? `/me/player/next?device_id=${deviceId}` : '/me/player/next';
    return this.apiClient.post(endpoint);
  }

  /**
   * Skips to previous track in the user's queue.
   * @param deviceId The id of the device this command is targeting.
   */
  async skipToPrevious(deviceId?: string): Promise<void> {
    const endpoint = deviceId ? `/me/player/previous?device_id=${deviceId}` : '/me/player/previous';
    return this.apiClient.post(endpoint);
  }

  /**
   * Seeks to the given position in the user's currently playing track.
   * @param positionMs The position in milliseconds to seek to.
   * @param deviceId The id of the device this command is targeting.
   */
  async seekToPosition(positionMs: number, deviceId?: string): Promise<void> {
    const params: Record<string, string | number> = { position_ms: positionMs };
    if (deviceId) params.device_id = deviceId;
    
    return this.apiClient.put('/me/player/seek', null, { params });
  }

  /**
   * Set the repeat mode for the user's playback.
   * @param state The repeat state: track, context, or off.
   * @param deviceId The id of the device this command is targeting.
   */
  async setRepeatMode(state: 'track' | 'context' | 'off', deviceId?: string): Promise<void> {
    const params: Record<string, string> = { state };
    if (deviceId) params.device_id = deviceId;
    
    return this.apiClient.put('/me/player/repeat', null, { params });
  }

  /**
   * Set the volume for the user's current playback device.
   * @param volumePercent The volume to set. Must be a value from 0 to 100 inclusive.
   * @param deviceId The id of the device this command is targeting.
   */
  async setPlaybackVolume(volumePercent: number, deviceId?: string): Promise<void> {
    if (volumePercent < 0 || volumePercent > 100) {
      throw new Error('Volume percent must be between 0 and 100');
    }
    
    const params: Record<string, string | number> = { volume_percent: volumePercent };
    if (deviceId) params.device_id = deviceId;
    
    return this.apiClient.put('/me/player/volume', null, { params });
  }

  /**
   * Toggle shuffle on or off for user's playback.
   * @param state Whether or not to shuffle user's playback.
   * @param deviceId The id of the device this command is targeting.
   */
  async toggleShuffle(state: boolean, deviceId?: string): Promise<void> {
    const params: Record<string, string | boolean> = { state };
    if (deviceId) params.device_id = deviceId;
    
    return this.apiClient.put('/me/player/shuffle', null, { params });
  }

  /**
   * Get tracks from the current user's recently played tracks.
   * @param options Optional parameters for the request.
   */
  async getRecentlyPlayedTracks(options?: {
    limit?: number;
    after?: number;
    before?: number;
  }): Promise<{
    href: string;
    limit: number;
    next?: string;
    cursors: {
      after?: string;
      before?: string;
    };
    total?: number;
    items: Array<{
      track: Track;
      played_at: string;
      context?: {
        type: string;
        href: string;
        external_urls: { spotify: string };
        uri: string;
      };
    }>;
  }> {
    return this.apiClient.get('/me/player/recently-played', options);
  }

  /**
   * Get the list of objects that make up the user's queue.
   */
  async getUserQueue(): Promise<{
    currently_playing?: Track;
    queue: Track[];
  }> {
    return this.apiClient.get('/me/player/queue');
  }

  /**
   * Add an item to the end of the user's current playback queue.
   * @param uri The uri of the item to add to the queue.
   * @param deviceId The id of the device this command is targeting.
   */
  async addItemToPlaybackQueue(uri: string, deviceId?: string): Promise<void> {
    const params: Record<string, string> = { uri };
    if (deviceId) params.device_id = deviceId;
    
    return this.apiClient.post('/me/player/queue', null, { params });
  }
}
