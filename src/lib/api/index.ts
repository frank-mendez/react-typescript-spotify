import { SpotifyApiClient } from './base.service';
import { ArtistService } from './artist.service';
import { AlbumService } from './album.service';
import { TrackService } from './track.service';
import { PlaylistService } from './playlist.service';
import { PlaybackService } from './playback.service';
import { SearchService } from './search.service';
import { BrowseService } from './browse.service';

export class SpotifyApi {
  private readonly apiClient: SpotifyApiClient;
  
  // Service instances
  public artists: ArtistService;
  public albums: AlbumService;
  public tracks: TrackService;
  public playlists: PlaylistService;
  public playback: PlaybackService;
  public search: SearchService;
  public browse: BrowseService;

  constructor(accessToken: string) {
    this.apiClient = new SpotifyApiClient(accessToken);
    
    // Initialize all services
    this.artists = new ArtistService(this.apiClient);
    this.albums = new AlbumService(this.apiClient);
    this.tracks = new TrackService(this.apiClient);
    this.playlists = new PlaylistService(this.apiClient);
    this.playback = new PlaybackService(this.apiClient);
    this.search = new SearchService(this.apiClient);
    this.browse = new BrowseService(this.apiClient);
  }

  /**
   * Update the access token for all API calls.
   * @param accessToken New access token
   */
  updateAccessToken(accessToken: string): void {
    this.apiClient.updateToken(accessToken);
  }

  /**
   * Get the current user's profile information.
   */
  async getCurrentUserProfile() {
    return this.apiClient.get('/me');
  }

  /**
   * Get a user's profile information.
   * @param userId The user's Spotify user ID.
   */
  async getUserProfile(userId: string) {
    return this.apiClient.get(`/users/${userId}`);
  }

  /**
   * Get detailed profile information about the current user.
   */
  async getCurrentUser() {
    return this.apiClient.get('/me');
  }
}

// Export individual services as well for more granular imports
export {
  SpotifyApiClient,
  ArtistService,
  AlbumService,
  TrackService,
  PlaylistService,
  PlaybackService,
  SearchService,
  BrowseService
};
