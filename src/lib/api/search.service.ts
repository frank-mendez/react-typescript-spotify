import { SpotifyApiClient } from './base.service';
import { SearchResult } from '../../data-objects/interface';

export class SearchService {
  constructor(private readonly apiClient: SpotifyApiClient) {}

  /**
   * Get Spotify Catalog information about albums, artists, playlists, tracks, shows or episodes that match a keyword string.
   * @param query Search query keywords and optional field filters and operators.
   * @param types A comma-separated list of item types to search across.
   * @param options Optional parameters for the request.
   */
  async search(
    query: string,
    types: ('album' | 'artist' | 'playlist' | 'track' | 'show' | 'episode')[],
    options?: {
      market?: string;
      limit?: number;
      offset?: number;
      include_external?: 'audio';
    }
  ): Promise<SearchResult> {
    const params: Record<string, string | number> = {
      q: query,
      type: types.join(','),
      ...options
    };

    return this.apiClient.get<SearchResult>('/search', params);
  }

  /**
   * Search for albums.
   * @param query Search query keywords.
   * @param options Optional parameters for the request.
   */
  async searchAlbums(
    query: string,
    options?: {
      market?: string;
      limit?: number;
      offset?: number;
      include_external?: 'audio';
    }
  ) {
    return this.search(query, ['album'], options);
  }

  /**
   * Search for artists.
   * @param query Search query keywords.
   * @param options Optional parameters for the request.
   */
  async searchArtists(
    query: string,
    options?: {
      market?: string;
      limit?: number;
      offset?: number;
      include_external?: 'audio';
    }
  ) {
    return this.search(query, ['artist'], options);
  }

  /**
   * Search for playlists.
   * @param query Search query keywords.
   * @param options Optional parameters for the request.
   */
  async searchPlaylists(
    query: string,
    options?: {
      market?: string;
      limit?: number;
      offset?: number;
      include_external?: 'audio';
    }
  ) {
    return this.search(query, ['playlist'], options);
  }

  /**
   * Search for tracks.
   * @param query Search query keywords.
   * @param options Optional parameters for the request.
   */
  async searchTracks(
    query: string,
    options?: {
      market?: string;
      limit?: number;
      offset?: number;
      include_external?: 'audio';
    }
  ) {
    return this.search(query, ['track'], options);
  }
}
