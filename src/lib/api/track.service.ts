import { SpotifyApiClient } from './base.service';
import { 
  Track,
  UserSavedTracks,
  AudioFeatures,
  Recommendations
} from '../../data-objects/interface';

export class TrackService {
  constructor(private readonly apiClient: SpotifyApiClient) {}

  /**
   * Get Spotify catalog information for a single track identified by its unique Spotify ID.
   * @param trackId The Spotify ID for the track.
   * @param market An ISO 3166-1 alpha-2 country code.
   */
  async getTrack(trackId: string, market?: string): Promise<Track> {
    const params = market ? { market } : {};
    return this.apiClient.get<Track>(`/tracks/${trackId}`, params);
  }

  /**
   * Get Spotify catalog information for multiple tracks based on their Spotify IDs.
   * @param trackIds Array of Spotify track IDs. Maximum: 50 IDs.
   * @param market An ISO 3166-1 alpha-2 country code.
   */
  async getTracks(trackIds: string[], market?: string): Promise<{ tracks: Track[] }> {
    const ids = trackIds.slice(0, 50).join(',');
    const params = market ? { ids, market } : { ids };
    return this.apiClient.get<{ tracks: Track[] }>('/tracks', params);
  }

  /**
   * Get a list of the songs saved in the current Spotify user's 'Your Music' library.
   * @param options Optional parameters for the request.
   */
  async getUserSavedTracks(options?: {
    market?: string;
    limit?: number;
    offset?: number;
  }): Promise<UserSavedTracks> {
    return this.apiClient.get<UserSavedTracks>('/me/tracks', options);
  }

  /**
   * Save one or more tracks to the current user's 'Your Music' library.
   * @param trackIds Array of Spotify track IDs. Maximum: 50 IDs.
   */
  async saveTracks(trackIds: string[]): Promise<void> {
    const ids = trackIds.slice(0, 50).join(',');
    return this.apiClient.put('/me/tracks', null, {
      params: { ids }
    });
  }

  /**
   * Remove one or more tracks from the current user's 'Your Music' library.
   * @param trackIds Array of Spotify track IDs. Maximum: 50 IDs.
   */
  async removeTracks(trackIds: string[]): Promise<void> {
    const ids = trackIds.slice(0, 50).join(',');
    return this.apiClient.delete(`/me/tracks?ids=${ids}`);
  }

  /**
   * Check if one or more tracks is already saved in the current Spotify user's 'Your Music' library.
   * @param trackIds Array of Spotify track IDs. Maximum: 50 IDs.
   */
  async checkSavedTracks(trackIds: string[]): Promise<boolean[]> {
    const ids = trackIds.slice(0, 50).join(',');
    return this.apiClient.get<boolean[]>('/me/tracks/contains', { ids });
  }

  /**
   * Get audio features for a single track identified by its unique Spotify ID.
   * @param trackId The Spotify ID for the track.
   */
  async getTrackAudioFeatures(trackId: string): Promise<AudioFeatures> {
    return this.apiClient.get<AudioFeatures>(`/audio-features/${trackId}`);
  }

  /**
   * Get audio features for multiple tracks based on their Spotify IDs.
   * @param trackIds Array of Spotify track IDs. Maximum: 100 IDs.
   */
  async getTracksAudioFeatures(trackIds: string[]): Promise<{ audio_features: AudioFeatures[] }> {
    const ids = trackIds.slice(0, 100).join(',');
    return this.apiClient.get<{ audio_features: AudioFeatures[] }>('/audio-features', { ids });
  }

  /**
   * Get track recommendations based on seed artists, tracks, and genres.
   * @param options Parameters for generating recommendations.
   */
  async getRecommendations(options: {
    seed_artists?: string[];
    seed_tracks?: string[];
    seed_genres?: string[];
    limit?: number;
    market?: string;
    min_acousticness?: number;
    max_acousticness?: number;
    target_acousticness?: number;
    min_danceability?: number;
    max_danceability?: number;
    target_danceability?: number;
    min_duration_ms?: number;
    max_duration_ms?: number;
    target_duration_ms?: number;
    min_energy?: number;
    max_energy?: number;
    target_energy?: number;
    min_instrumentalness?: number;
    max_instrumentalness?: number;
    target_instrumentalness?: number;
    min_key?: number;
    max_key?: number;
    target_key?: number;
    min_liveness?: number;
    max_liveness?: number;
    target_liveness?: number;
    min_loudness?: number;
    max_loudness?: number;
    target_loudness?: number;
    min_mode?: number;
    max_mode?: number;
    target_mode?: number;
    min_popularity?: number;
    max_popularity?: number;
    target_popularity?: number;
    min_speechiness?: number;
    max_speechiness?: number;
    target_speechiness?: number;
    min_tempo?: number;
    max_tempo?: number;
    target_tempo?: number;
    min_time_signature?: number;
    max_time_signature?: number;
    target_time_signature?: number;
    min_valence?: number;
    max_valence?: number;
    target_valence?: number;
  }): Promise<Recommendations> {
    // Combine seed arrays and limit total seeds to 5
    const seeds = [
      ...(options.seed_artists || []),
      ...(options.seed_tracks || []),
      ...(options.seed_genres || [])
    ];
    
    if (seeds.length === 0) {
      throw new Error('At least one seed must be provided');
    }
    
    if (seeds.length > 5) {
      throw new Error('Maximum of 5 seeds allowed in total');
    }

    const params: Record<string, string | number | undefined> = { ...options } as Record<string, string | number | undefined>;
    
    // Convert arrays to comma-separated strings
    if (options.seed_artists) {
      params.seed_artists = options.seed_artists.join(',');
    }
    if (options.seed_tracks) {
      params.seed_tracks = options.seed_tracks.join(',');
    }
    if (options.seed_genres) {
      params.seed_genres = options.seed_genres.join(',');
    }

    return this.apiClient.get<Recommendations>('/recommendations', params);
  }

  /**
   * Get available genre seeds for recommendations.
   */
  async getAvailableGenreSeeds(): Promise<{ genres: string[] }> {
    return this.apiClient.get<{ genres: string[] }>('/recommendations/available-genre-seeds');
  }
}
