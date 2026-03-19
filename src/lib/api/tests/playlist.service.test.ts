import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlaylistService } from '../playlist.service';
import { SpotifyApiClient } from '../base.service';
import { 
  Playlist,
  PlaylistTrack,
  PaginatedResponse,
  UserPlaylists 
} from '../../../data-objects/interface';

// Mock the base service
vi.mock('../base.service');

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
} as unknown as SpotifyApiClient;

describe('PlaylistService', () => {
  let playlistService: PlaylistService;

  beforeEach(() => {
    vi.clearAllMocks();
    playlistService = new PlaylistService(mockApiClient);
  });

  describe('getPlaylist', () => {
    it('should get a playlist by ID', async () => {
      const mockPlaylist: Partial<Playlist> = {
        id: 'test-playlist-id',
        name: 'Test Playlist',
        description: 'A test playlist',
        public: true,
        collaborative: false
      };

      (mockApiClient.get as any).mockResolvedValue(mockPlaylist);

      const result = await playlistService.getPlaylist('test-playlist-id');

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/playlists/test-playlist-id',
        undefined
      );
      expect(result).toEqual(mockPlaylist);
    });

    it('should get a playlist with options', async () => {
      const mockPlaylist: Partial<Playlist> = {
        id: 'test-playlist-id',
        name: 'Test Playlist'
      };
      const options = {
        market: 'US',
        fields: 'name,description',
        additional_types: 'track'
      };

      (mockApiClient.get as any).mockResolvedValue(mockPlaylist);

      const result = await playlistService.getPlaylist('test-playlist-id', options);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/playlists/test-playlist-id',
        options
      );
      expect(result).toEqual(mockPlaylist);
    });
  });

  describe('getPlaylistItems', () => {
    it('should get playlist items', async () => {
      const mockResponse: Partial<PaginatedResponse<PlaylistTrack>> = {
        items: [
          {
            track: { id: 'track1', name: 'Track 1' } as any,
            added_at: '2023-01-01T00:00:00Z',
            added_by: { id: 'user1' } as any,
            is_local: false
          }
        ],
        total: 1,
        limit: 20,
        offset: 0
      };

      (mockApiClient.get as any).mockResolvedValue(mockResponse);

      const result = await playlistService.getPlaylistItems('test-playlist-id');

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/playlists/test-playlist-id/tracks',
        undefined
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get playlist items with options', async () => {
      const mockResponse: Partial<PaginatedResponse<PlaylistTrack>> = {
        items: [],
        total: 0,
        limit: 10,
        offset: 5
      };
      const options = {
        market: 'US',
        fields: 'items(track(name))',
        limit: 10,
        offset: 5,
        additional_types: 'episode'
      };

      (mockApiClient.get as any).mockResolvedValue(mockResponse);

      const result = await playlistService.getPlaylistItems('test-playlist-id', options);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/playlists/test-playlist-id/tracks',
        options
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCurrentUserPlaylists', () => {
    it('should get current user playlists', async () => {
      const mockPlaylists: Partial<UserPlaylists> = {
        items: [
          {
            id: 'playlist1',
            name: 'My Playlist 1'
          } as Playlist
        ],
        total: 1,
        limit: 20,
        offset: 0
      };

      (mockApiClient.get as any).mockResolvedValue(mockPlaylists);

      const result = await playlistService.getCurrentUserPlaylists();

      expect(mockApiClient.get).toHaveBeenCalledWith('/me/playlists', undefined);
      expect(result).toEqual(mockPlaylists);
    });

    it('should get current user playlists with options', async () => {
      const mockPlaylists: Partial<UserPlaylists> = {
        items: [],
        total: 0,
        limit: 10,
        offset: 5
      };
      const options = { limit: 10, offset: 5 };

      (mockApiClient.get as any).mockResolvedValue(mockPlaylists);

      const result = await playlistService.getCurrentUserPlaylists(options);

      expect(mockApiClient.get).toHaveBeenCalledWith('/me/playlists', options);
      expect(result).toEqual(mockPlaylists);
    });
  });

  describe('getUserPlaylists', () => {
    it('should get user playlists by user ID', async () => {
      const mockPlaylists: Partial<UserPlaylists> = {
        items: [
          {
            id: 'playlist1',
            name: 'User Playlist 1'
          } as Playlist
        ],
        total: 1,
        limit: 20,
        offset: 0
      };

      (mockApiClient.get as any).mockResolvedValue(mockPlaylists);

      const result = await playlistService.getUserPlaylists('test-user-id');

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/users/test-user-id/playlists',
        undefined
      );
      expect(result).toEqual(mockPlaylists);
    });

    it('should get user playlists with options', async () => {
      const mockPlaylists: Partial<UserPlaylists> = {
        items: [],
        total: 0,
        limit: 5,
        offset: 10
      };
      const options = { limit: 5, offset: 10 };

      (mockApiClient.get as any).mockResolvedValue(mockPlaylists);

      const result = await playlistService.getUserPlaylists('test-user-id', options);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/users/test-user-id/playlists',
        options
      );
      expect(result).toEqual(mockPlaylists);
    });
  });

  describe('createPlaylist', () => {
    it('should create a playlist with minimal data', async () => {
      const mockPlaylist: Partial<Playlist> = {
        id: 'new-playlist-id',
        name: 'New Playlist',
        public: true,
        collaborative: false
      };
      const playlistData = { name: 'New Playlist' };

      (mockApiClient.post as any).mockResolvedValue(mockPlaylist);

      const result = await playlistService.createPlaylist('user-id', playlistData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/users/user-id/playlists',
        playlistData
      );
      expect(result).toEqual(mockPlaylist);
    });

    it('should create a playlist with full data', async () => {
      const mockPlaylist: Partial<Playlist> = {
        id: 'new-playlist-id',
        name: 'My Private Playlist',
        description: 'A private collaborative playlist',
        public: false,
        collaborative: true
      };
      const playlistData = {
        name: 'My Private Playlist',
        description: 'A private collaborative playlist',
        public: false,
        collaborative: true
      };

      (mockApiClient.post as any).mockResolvedValue(mockPlaylist);

      const result = await playlistService.createPlaylist('user-id', playlistData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/users/user-id/playlists',
        playlistData
      );
      expect(result).toEqual(mockPlaylist);
    });
  });

  describe('addItemsToPlaylist', () => {
    it('should add items to playlist with URIs only', async () => {
      const mockResponse = { snapshot_id: 'new-snapshot-id' };
      const data = { uris: ['spotify:track:track1', 'spotify:track:track2'] };

      (mockApiClient.post as any).mockResolvedValue(mockResponse);

      const result = await playlistService.addItemsToPlaylist('playlist-id', data);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/playlists/playlist-id/tracks',
        data
      );
      expect(result).toEqual(mockResponse);
    });

    it('should add items to playlist with position', async () => {
      const mockResponse = { snapshot_id: 'new-snapshot-id-2' };
      const data = {
        uris: ['spotify:track:track1'],
        position: 5
      };

      (mockApiClient.post as any).mockResolvedValue(mockResponse);

      const result = await playlistService.addItemsToPlaylist('playlist-id', data);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/playlists/playlist-id/tracks',
        data
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('removeItemsFromPlaylist', () => {
    it('should remove items from playlist', async () => {
      const mockResponse = { snapshot_id: 'updated-snapshot-id' };
      const tracks = [
        { uri: 'spotify:track:track1' },
        { uri: 'spotify:track:track2', positions: [0, 1] }
      ];

      (mockApiClient.delete as any).mockResolvedValue(mockResponse);

      const result = await playlistService.removeItemsFromPlaylist('playlist-id', tracks);

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        '/playlists/playlist-id/tracks',
        { tracks }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('replacePlaylistItems', () => {
    it('should replace all playlist items', async () => {
      const uris = ['spotify:track:track1', 'spotify:track:track2', 'spotify:track:track3'];

      (mockApiClient.put as any).mockResolvedValue(undefined);

      const result = await playlistService.replacePlaylistItems('playlist-id', uris);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        '/playlists/playlist-id/tracks',
        { uris }
      );
      expect(result).toBeUndefined();
    });

    it('should replace playlist items with empty array', async () => {
      const uris: string[] = [];

      (mockApiClient.put as any).mockResolvedValue(undefined);

      const result = await playlistService.replacePlaylistItems('playlist-id', uris);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        '/playlists/playlist-id/tracks',
        { uris }
      );
      expect(result).toBeUndefined();
    });
  });

  describe('updatePlaylistDetails', () => {
    it('should update playlist name only', async () => {
      const data = { name: 'Updated Playlist Name' };

      (mockApiClient.put as any).mockResolvedValue(undefined);

      const result = await playlistService.updatePlaylistDetails('playlist-id', data);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        '/playlists/playlist-id',
        data
      );
      expect(result).toBeUndefined();
    });

    it('should update all playlist details', async () => {
      const data = {
        name: 'New Name',
        description: 'New description',
        public: false,
        collaborative: true
      };

      (mockApiClient.put as any).mockResolvedValue(undefined);

      const result = await playlistService.updatePlaylistDetails('playlist-id', data);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        '/playlists/playlist-id',
        data
      );
      expect(result).toBeUndefined();
    });
  });

  describe('followPlaylist', () => {
    it('should follow playlist publicly by default', async () => {
      (mockApiClient.put as any).mockResolvedValue(undefined);

      const result = await playlistService.followPlaylist('playlist-id');

      expect(mockApiClient.put).toHaveBeenCalledWith(
        '/playlists/playlist-id/followers',
        { public: true }
      );
      expect(result).toBeUndefined();
    });

    it('should follow playlist privately', async () => {
      (mockApiClient.put as any).mockResolvedValue(undefined);

      const result = await playlistService.followPlaylist('playlist-id', false);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        '/playlists/playlist-id/followers',
        { public: false }
      );
      expect(result).toBeUndefined();
    });
  });

  describe('unfollowPlaylist', () => {
    it('should unfollow playlist', async () => {
      (mockApiClient.delete as any).mockResolvedValue(undefined);

      const result = await playlistService.unfollowPlaylist('playlist-id');

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        '/playlists/playlist-id/followers'
      );
      expect(result).toBeUndefined();
    });
  });

  describe('getFeaturedPlaylists', () => {
    it('should get featured playlists without options', async () => {
      const mockResponse = {
        message: 'Featured playlists',
        playlists: {
          items: [{ id: 'featured1', name: 'Featured Playlist 1' }],
          total: 1,
          limit: 20,
          offset: 0
        }
      };

      (mockApiClient.get as any).mockResolvedValue(mockResponse);

      const result = await playlistService.getFeaturedPlaylists();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/browse/featured-playlists',
        undefined
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get featured playlists with options', async () => {
      const mockResponse = {
        message: 'Monday Morning Music',
        playlists: {
          items: [],
          total: 0,
          limit: 10,
          offset: 5
        }
      };
      const options = {
        country: 'US',
        limit: 10,
        offset: 5,
        timestamp: '2023-12-01T00:00:00'
      };

      (mockApiClient.get as any).mockResolvedValue(mockResponse);

      const result = await playlistService.getFeaturedPlaylists(options);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/browse/featured-playlists',
        options
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCategoryPlaylists', () => {
    it('should get category playlists', async () => {
      const mockResponse = {
        message: 'Pop playlists',
        playlists: {
          items: [{ id: 'pop1', name: 'Pop Playlist 1' }],
          total: 1,
          limit: 20,
          offset: 0
        }
      };

      (mockApiClient.get as any).mockResolvedValue(mockResponse);

      const result = await playlistService.getCategoryPlaylists('pop');

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/browse/categories/pop/playlists',
        undefined
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get category playlists with options', async () => {
      const mockResponse = {
        playlists: {
          items: [],
          total: 0,
          limit: 15,
          offset: 10
        }
      };
      const options = {
        country: 'GB',
        limit: 15,
        offset: 10
      };

      (mockApiClient.get as any).mockResolvedValue(mockResponse);

      const result = await playlistService.getCategoryPlaylists('rock', options);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/browse/categories/rock/playlists',
        options
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('reorderPlaylistItems', () => {
    it('should reorder playlist items with minimal data', async () => {
      const mockResponse = { snapshot_id: 'reordered-snapshot-id' };
      const data = {
        range_start: 1,
        insert_before: 3
      };

      (mockApiClient.put as any).mockResolvedValue(mockResponse);

      const result = await playlistService.reorderPlaylistItems('playlist-id', data);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        '/playlists/playlist-id/tracks',
        data
      );
      expect(result).toEqual(mockResponse);
    });

    it('should reorder playlist items with full data', async () => {
      const mockResponse = { snapshot_id: 'reordered-snapshot-id-2' };
      const data = {
        range_start: 0,
        insert_before: 5,
        range_length: 3,
        snapshot_id: 'current-snapshot-id'
      };

      (mockApiClient.put as any).mockResolvedValue(mockResponse);

      const result = await playlistService.reorderPlaylistItems('playlist-id', data);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        '/playlists/playlist-id/tracks',
        data
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle errors when getting playlist', async () => {
      const error = new Error('Playlist not found');
      (mockApiClient.get as any).mockRejectedValue(error);

      await expect(
        playlistService.getPlaylist('invalid-playlist-id')
      ).rejects.toThrow('Playlist not found');
    });

    it('should handle errors when creating playlist', async () => {
      const error = new Error('Invalid user ID');
      (mockApiClient.post as any).mockRejectedValue(error);

      await expect(
        playlistService.createPlaylist('invalid-user-id', { name: 'Test' })
      ).rejects.toThrow('Invalid user ID');
    });

    it('should handle errors when updating playlist', async () => {
      const error = new Error('Forbidden');
      (mockApiClient.put as any).mockRejectedValue(error);

      await expect(
        playlistService.updatePlaylistDetails('playlist-id', { name: 'New Name' })
      ).rejects.toThrow('Forbidden');
    });

    it('should handle errors when deleting from playlist', async () => {
      const error = new Error('Bad request');
      (mockApiClient.delete as any).mockRejectedValue(error);

      await expect(
        playlistService.removeItemsFromPlaylist('playlist-id', [{ uri: 'invalid-uri' }])
      ).rejects.toThrow('Bad request');
    });
  });
});
