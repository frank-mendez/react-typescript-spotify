import { SpotifyApiClient } from './base.service';
import { 
  Categories,
  Category,
  FeaturedPlaylists,
  NewReleases,
  PaginatedResponse,
  Playlist
} from '../../data-objects/interface';

export class BrowseService {
  constructor(private readonly apiClient: SpotifyApiClient) {}

  /**
   * Get a list of categories used to tag items in Spotify.
   * @param options Optional parameters for the request.
   */
  async getCategories(options?: {
    country?: string;
    locale?: string;
    limit?: number;
    offset?: number;
  }): Promise<Categories> {
    return this.apiClient.get<Categories>('/browse/categories', options);
  }

  /**
   * Get a single category used to tag items in Spotify.
   * @param categoryId The Spotify category ID for the category.
   * @param options Optional parameters for the request.
   */
  async getCategory(categoryId: string, options?: {
    country?: string;
    locale?: string;
  }): Promise<Category> {
    return this.apiClient.get<Category>(`/browse/categories/${categoryId}`, options);
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
   * Get a list of Spotify featured playlists.
   * @param options Optional parameters for the request.
   */
  async getFeaturedPlaylists(options?: {
    country?: string;
    limit?: number;
    offset?: number;
    timestamp?: string;
  }): Promise<FeaturedPlaylists> {
    return this.apiClient.get<FeaturedPlaylists>('/browse/featured-playlists', options);
  }

  /**
   * Get a list of new album releases featured in Spotify.
   * @param options Optional parameters for the request.
   */
  async getNewReleases(options?: {
    country?: string;
    limit?: number;
    offset?: number;
  }): Promise<NewReleases> {
    return this.apiClient.get<NewReleases>('/browse/new-releases', options);
  }

  /**
   * Get available genre seeds for recommendations.
   */
  async getAvailableGenreSeeds(): Promise<{ genres: string[] }> {
    return this.apiClient.get<{ genres: string[] }>('/recommendations/available-genre-seeds');
  }
}
