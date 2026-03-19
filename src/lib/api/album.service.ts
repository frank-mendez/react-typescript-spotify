import { SpotifyApiClient } from './base.service';
import { 
  Album, 
  Track,
  PaginatedResponse,
  UserSavedAlbums
} from '../../data-objects/interface';

export class AlbumService {
  constructor(private readonly apiClient: SpotifyApiClient) {}

  /**
   * Get Spotify catalog information for a single album.
   * @param albumId The Spotify ID for the album.
   * @param market An ISO 3166-1 alpha-2 country code.
   */
  async getAlbum(albumId: string, market?: string): Promise<Album> {
    const params = market ? { market } : {};
    return this.apiClient.get<Album>(`/albums/${albumId}`, params);
  }

  /**
   * Get Spotify catalog information for multiple albums identified by their Spotify IDs.
   * @param albumIds Array of Spotify album IDs. Maximum: 20 IDs.
   * @param market An ISO 3166-1 alpha-2 country code.
   */
  async getAlbums(albumIds: string[], market?: string): Promise<{ albums: Album[] }> {
    const ids = albumIds.slice(0, 20).join(',');
    const params = market ? { ids, market } : { ids };
    return this.apiClient.get<{ albums: Album[] }>('/albums', params);
  }

  /**
   * Get Spotify catalog information about an album's tracks.
   * @param albumId The Spotify ID for the album.
   * @param options Optional parameters for the request.
   */
  async getAlbumTracks(
    albumId: string, 
    options?: {
      market?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<PaginatedResponse<Track>> {
    return this.apiClient.get<PaginatedResponse<Track>>(`/albums/${albumId}/tracks`, options);
  }

  /**
   * Get a list of the albums saved in the current Spotify user's 'Your Music' library.
   * @param options Optional parameters for the request.
   */
  async getUserSavedAlbums(options?: {
    limit?: number;
    offset?: number;
    market?: string;
  }): Promise<UserSavedAlbums> {
    return this.apiClient.get<UserSavedAlbums>('/me/albums', options);
  }

  /**
   * Save one or more albums to the current user's 'Your Music' library.
   * @param albumIds Array of Spotify album IDs. Maximum: 50 IDs.
   */
  async saveAlbums(albumIds: string[]): Promise<void> {
    const ids = albumIds.slice(0, 50).join(',');
    return this.apiClient.put('/me/albums', null, {
      params: { ids }
    });
  }

  /**
   * Remove one or more albums from the current user's 'Your Music' library.
   * @param albumIds Array of Spotify album IDs. Maximum: 50 IDs.
   */
  async removeAlbums(albumIds: string[]): Promise<void> {
    const ids = albumIds.slice(0, 50).join(',');
    return this.apiClient.delete(`/me/albums?ids=${ids}`);
  }

  /**
   * Check if one or more albums is already saved in the current Spotify user's 'Your Music' library.
   * @param albumIds Array of Spotify album IDs. Maximum: 50 IDs.
   */
  async checkSavedAlbums(albumIds: string[]): Promise<boolean[]> {
    const ids = albumIds.slice(0, 50).join(',');
    return this.apiClient.get<boolean[]>('/me/albums/contains', { ids });
  }

  /**
   * Get a list of new album releases featured in Spotify.
   * @param options Optional parameters for the request.
   */
  async getNewReleases(options?: {
    country?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ albums: PaginatedResponse<Album> }> {
    return this.apiClient.get<{ albums: PaginatedResponse<Album> }>('/browse/new-releases', options);
  }
}
