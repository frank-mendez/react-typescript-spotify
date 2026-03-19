import { SpotifyApiClient } from './base.service';
import { 
  Playlist,
  PlaylistTrack,
  PaginatedResponse,
  UserPlaylists
} from '../../data-objects/interface';

export class PlaylistService {
  constructor(private readonly apiClient: SpotifyApiClient) {}

  /**
   * Get a playlist owned by a Spotify user.
   * @param playlistId The Spotify ID for the playlist.
   * @param options Optional parameters for the request.
   */
  async getPlaylist(
    playlistId: string,
    options?: {
      market?: string;
      fields?: string;
      additional_types?: string;
    }
  ): Promise<Playlist> {
    return this.apiClient.get<Playlist>(`/playlists/${playlistId}`, options);
  }

  /**
   * Get full details of the items of a playlist owned by a Spotify user.
   * @param playlistId The Spotify ID for the playlist.
   * @param options Optional parameters for the request.
   */
  async getPlaylistItems(
    playlistId: string,
    options?: {
      market?: string;
      fields?: string;
      limit?: number;
      offset?: number;
      additional_types?: string;
    }
  ): Promise<PaginatedResponse<PlaylistTrack>> {
    return this.apiClient.get<PaginatedResponse<PlaylistTrack>>(`/playlists/${playlistId}/tracks`, options);
  }

  /**
   * Get a list of the playlists owned or followed by the current Spotify user.
   * @param options Optional parameters for the request.
   */
  async getCurrentUserPlaylists(options?: {
    limit?: number;
    offset?: number;
  }): Promise<UserPlaylists> {
    return this.apiClient.get<UserPlaylists>('/me/playlists', options);
  }

  /**
   * Get a list of the playlists owned or followed by a Spotify user.
   * @param userId The user's Spotify user ID.
   * @param options Optional parameters for the request.
   */
  async getUserPlaylists(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<UserPlaylists> {
    return this.apiClient.get<UserPlaylists>(`/users/${userId}/playlists`, options);
  }

  /**
   * Create a playlist for a Spotify user.
   * @param userId The user's Spotify user ID.
   * @param playlistData Data for the new playlist.
   */
  async createPlaylist(
    userId: string,
    playlistData: {
      name: string;
      description?: string;
      public?: boolean;
      collaborative?: boolean;
    }
  ): Promise<Playlist> {
    return this.apiClient.post<Playlist>(`/users/${userId}/playlists`, playlistData);
  }

  /**
   * Add one or more items to a user's playlist.
   * @param playlistId The Spotify ID for the playlist.
   * @param data Items to add to the playlist.
   */
  async addItemsToPlaylist(
    playlistId: string,
    data: {
      uris?: string[];
      position?: number;
    }
  ): Promise<{ snapshot_id: string }> {
    return this.apiClient.post<{ snapshot_id: string }>(`/playlists/${playlistId}/tracks`, data);
  }

  /**
   * Remove one or more items from a user's playlist.
   * @param playlistId The Spotify ID for the playlist.
   * @param tracks Items to remove from the playlist.
   */
  async removeItemsFromPlaylist(
    playlistId: string,
    tracks: { uri: string; positions?: number[] }[]
  ): Promise<{ snapshot_id: string }> {
    return this.apiClient.delete<{ snapshot_id: string }>(`/playlists/${playlistId}/tracks`, { tracks });
  }

  /**
   * Replace all the items in a playlist, overwriting its existing items.
   * @param playlistId The Spotify ID for the playlist.
   * @param uris Array of Spotify URIs to set.
   */
  async replacePlaylistItems(
    playlistId: string,
    uris: string[]
  ): Promise<void> {
    return this.apiClient.put('/playlists/' + playlistId + '/tracks', { uris });
  }

  /**
   * Change a playlist's name and public/private state.
   * @param playlistId The Spotify ID for the playlist.
   * @param data Playlist details to update.
   */
  async updatePlaylistDetails(
    playlistId: string,
    data: {
      name?: string;
      description?: string;
      public?: boolean;
      collaborative?: boolean;
    }
  ): Promise<void> {
    return this.apiClient.put(`/playlists/${playlistId}`, data);
  }

  /**
   * Add the current user as a follower of a playlist.
   * @param playlistId The Spotify ID for the playlist.
   * @param publicFollow If true, the playlist will be included in user's public playlists.
   */
  async followPlaylist(playlistId: string, publicFollow: boolean = true): Promise<void> {
    return this.apiClient.put(`/playlists/${playlistId}/followers`, { public: publicFollow });
  }

  /**
   * Remove the current user as a follower of a playlist.
   * @param playlistId The Spotify ID for the playlist.
   */
  async unfollowPlaylist(playlistId: string): Promise<void> {
    return this.apiClient.delete(`/playlists/${playlistId}/followers`);
  }

  /**
   * Get a list of Spotify featured playlists.
   * @param options Optional parameters for the request.
   */
  async getFeaturedPlaylists(options?: {
    country?: string;
    limit?: number;
    offset?: number;
    timestamp?: string;
  }): Promise<{ message?: string; playlists: PaginatedResponse<Playlist> }> {
    return this.apiClient.get<{ message?: string; playlists: PaginatedResponse<Playlist> }>('/browse/featured-playlists', options);
  }

  /**
   * Get a list of Spotify playlists tagged with a particular category.
   * @param categoryId The Spotify category ID for the category.
   * @param options Optional parameters for the request.
   */
  async getCategoryPlaylists(
    categoryId: string,
    options?: {
      country?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ message?: string; playlists: PaginatedResponse<Playlist> }> {
    return this.apiClient.get<{ message?: string; playlists: PaginatedResponse<Playlist> }>(`/browse/categories/${categoryId}/playlists`, options);
  }

  /**
   * Reorder items in a playlist.
   * @param playlistId The Spotify ID for the playlist.
   * @param data Parameters for reordering.
   */
  async reorderPlaylistItems(
    playlistId: string,
    data: {
      range_start: number;
      insert_before: number;
      range_length?: number;
      snapshot_id?: string;
    }
  ): Promise<{ snapshot_id: string }> {
    return this.apiClient.put<{ snapshot_id: string }>(`/playlists/${playlistId}/tracks`, data);
  }
}
