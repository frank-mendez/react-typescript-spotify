import { SpotifyApiClient } from './base.service';
import { 
  Artist, 
  ArtistTopTracks, 
  ArtistAlbums,
  PaginatedResponse 
} from '../../data-objects/interface';

export class ArtistService {
  constructor(private readonly apiClient: SpotifyApiClient) {}

  /**
   * Get Spotify catalog information for a single artist identified by their unique Spotify ID.
   * @param artistId The Spotify ID for the artist.
   */
  async getArtist(artistId: string): Promise<Artist> {
    return this.apiClient.get<Artist>(`/artists/${artistId}`);
  }

  /**
   * Get Spotify catalog information for several artists based on their Spotify IDs.
   * @param artistIds Array of Spotify artist IDs. Maximum: 50 IDs.
   */
  async getArtists(artistIds: string[]): Promise<{ artists: Artist[] }> {
    const ids = artistIds.slice(0, 50).join(',');
    return this.apiClient.get<{ artists: Artist[] }>('/artists', { ids });
  }

  /**
   * Get Spotify catalog information about an artist's albums.
   * @param artistId The Spotify ID for the artist.
   * @param options Optional parameters for the request.
   */
  async getArtistAlbums(
    artistId: string, 
    options?: {
      include_groups?: 'album' | 'single' | 'appears_on' | 'compilation';
      market?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<ArtistAlbums> {
    return this.apiClient.get<ArtistAlbums>(`/artists/${artistId}/albums`, options);
  }

  /**
   * Get Spotify catalog information about an artist's top tracks by country.
   * @param artistId The Spotify ID for the artist.
   * @param market An ISO 3166-1 alpha-2 country code.
   */
  async getArtistTopTracks(artistId: string, market: string = 'US'): Promise<ArtistTopTracks> {
    return this.apiClient.get<ArtistTopTracks>(`/artists/${artistId}/top-tracks`, { market });
  }

  /**
   * Get Spotify catalog information about artists similar to a given artist.
   * @param artistId The Spotify ID for the artist.
   */
  async getRelatedArtists(artistId: string): Promise<{ artists: Artist[] }> {
    return this.apiClient.get<{ artists: Artist[] }>(`/artists/${artistId}/related-artists`);
  }

  /**
   * Get the current user's followed artists.
   * @param options Optional parameters for the request.
   */
  async getFollowedArtists(options?: {
    type?: 'artist';
    after?: string;
    limit?: number;
  }): Promise<{ artists: PaginatedResponse<Artist> }> {
    return this.apiClient.get<{ artists: PaginatedResponse<Artist> }>('/me/following', {
      type: 'artist',
      ...options
    });
  }

  /**
   * Add the current user as a follower of one or more artists.
   * @param artistIds Array of Spotify artist IDs. Maximum: 50 IDs.
   */
  async followArtists(artistIds: string[]): Promise<void> {
    const ids = artistIds.slice(0, 50).join(',');
    return this.apiClient.put('/me/following', null, {
      params: { type: 'artist', ids }
    });
  }

  /**
   * Remove the current user as a follower of one or more artists.
   * @param artistIds Array of Spotify artist IDs. Maximum: 50 IDs.
   */
  async unfollowArtists(artistIds: string[]): Promise<void> {
    const ids = artistIds.slice(0, 50).join(',');
    return this.apiClient.delete(`/me/following?type=artist&ids=${ids}`);
  }

  /**
   * Check to see if the current user is following one or more artists.
   * @param artistIds Array of Spotify artist IDs. Maximum: 50 IDs.
   */
  async checkFollowingArtists(artistIds: string[]): Promise<boolean[]> {
    const ids = artistIds.slice(0, 50).join(',');
    return this.apiClient.get<boolean[]>('/me/following/contains', { 
      type: 'artist', 
      ids 
    });
  }
}
