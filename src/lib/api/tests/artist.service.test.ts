import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { ArtistService } from '../artist.service';
import type { Artist, ArtistTopTracks, ArtistAlbums } from '../../../data-objects/interface';

// Mock the base service
vi.mock('../base.service');

describe('ArtistService', () => {
  let artistService: ArtistService;
  let mockApiClient: {
    get: MockedFunction<any>;
    put: MockedFunction<any>;
    delete: MockedFunction<any>;
    post: MockedFunction<any>;
  };

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      put: vi.fn(), 
      delete: vi.fn(),
      post: vi.fn()
    };
    artistService = new ArtistService(mockApiClient as any);
  });

  describe('getArtist', () => {
    it('should get a single artist by ID', async () => {
      const mockArtist: Artist = {
        id: 'artist123',
        name: 'Test Artist',
        type: 'artist',
        uri: 'spotify:artist:artist123',
        href: 'https://api.spotify.com/v1/artists/artist123',
        external_urls: { spotify: 'https://open.spotify.com/artist/artist123' },
        followers: { href: '', total: 1000 },
        genres: ['rock', 'pop'],
        images: [],
        popularity: 75
      };

      mockApiClient.get.mockResolvedValue(mockArtist);

      const result = await artistService.getArtist('artist123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/artists/artist123');
      expect(result).toEqual(mockArtist);
    });
  });

  describe('getArtists', () => {
    it('should get multiple artists by IDs', async () => {
      const mockResponse = {
        artists: [
          { id: 'artist1', name: 'Artist 1' },
          { id: 'artist2', name: 'Artist 2' }
        ]
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await artistService.getArtists(['artist1', 'artist2']);

      expect(mockApiClient.get).toHaveBeenCalledWith('/artists', { ids: 'artist1,artist2' });
      expect(result).toEqual(mockResponse);
    });

    it('should limit artist IDs to maximum of 50', async () => {
      const artistIds = Array.from({ length: 60 }, (_, i) => `artist${i}`);
      const expectedIds = artistIds.slice(0, 50).join(',');

      mockApiClient.get.mockResolvedValue({ artists: [] });

      await artistService.getArtists(artistIds);

      expect(mockApiClient.get).toHaveBeenCalledWith('/artists', { ids: expectedIds });
    });
  });

  describe('getArtistAlbums', () => {
    it('should get artist albums without options', async () => {
      const mockAlbums: ArtistAlbums = {
        href: 'https://api.spotify.com/v1/artists/artist123/albums',
        items: [],
        limit: 20,
        next: undefined,
        offset: 0,
        previous: undefined,
        total: 0
      };

      mockApiClient.get.mockResolvedValue(mockAlbums);

      const result = await artistService.getArtistAlbums('artist123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/artists/artist123/albums', undefined);
      expect(result).toEqual(mockAlbums);
    });

    it('should get artist albums with options', async () => {
      const options = {
        include_groups: 'album' as const,
        market: 'US',
        limit: 10,
        offset: 20
      };

      mockApiClient.get.mockResolvedValue({ items: [] });

      await artistService.getArtistAlbums('artist123', options);

      expect(mockApiClient.get).toHaveBeenCalledWith('/artists/artist123/albums', options);
    });
  });

  describe('getArtistTopTracks', () => {
    it('should get artist top tracks with default market', async () => {
      const mockTopTracks: ArtistTopTracks = {
        tracks: []
      };

      mockApiClient.get.mockResolvedValue(mockTopTracks);

      const result = await artistService.getArtistTopTracks('artist123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/artists/artist123/top-tracks', { market: 'US' });
      expect(result).toEqual(mockTopTracks);
    });

    it('should get artist top tracks with custom market', async () => {
      const mockTopTracks: ArtistTopTracks = {
        tracks: []
      };

      mockApiClient.get.mockResolvedValue(mockTopTracks);

      const result = await artistService.getArtistTopTracks('artist123', 'GB');

      expect(mockApiClient.get).toHaveBeenCalledWith('/artists/artist123/top-tracks', { market: 'GB' });
      expect(result).toEqual(mockTopTracks);
    });
  });

  describe('getRelatedArtists', () => {
    it('should get related artists', async () => {
      const mockResponse = {
        artists: [
          { id: 'related1', name: 'Related Artist 1' },
          { id: 'related2', name: 'Related Artist 2' }
        ]
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await artistService.getRelatedArtists('artist123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/artists/artist123/related-artists');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getFollowedArtists', () => {
    it('should get followed artists without options', async () => {
      const mockResponse = {
        artists: {
          href: 'https://api.spotify.com/v1/me/following',
          items: [],
          limit: 20,
          next: undefined,
          offset: 0,
          cursors: { after: '' },
          total: 0
        }
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await artistService.getFollowedArtists();

      expect(mockApiClient.get).toHaveBeenCalledWith('/me/following', { type: 'artist' });
      expect(result).toEqual(mockResponse);
    });

    it('should get followed artists with options', async () => {
      const options = {
        type: 'artist' as const,
        after: 'cursor123',
        limit: 10
      };

      mockApiClient.get.mockResolvedValue({ artists: { items: [] } });

      await artistService.getFollowedArtists(options);

      expect(mockApiClient.get).toHaveBeenCalledWith('/me/following', {
        type: 'artist',
        after: 'cursor123',
        limit: 10
      });
    });
  });

  describe('followArtists', () => {
    it('should follow artists', async () => {
      mockApiClient.put.mockResolvedValue(undefined);

      await artistService.followArtists(['artist1', 'artist2']);

      expect(mockApiClient.put).toHaveBeenCalledWith('/me/following', null, {
        params: { type: 'artist', ids: 'artist1,artist2' }
      });
    });

    it('should limit artist IDs to maximum of 50 when following', async () => {
      const artistIds = Array.from({ length: 60 }, (_, i) => `artist${i}`);
      const expectedIds = artistIds.slice(0, 50).join(',');

      mockApiClient.put.mockResolvedValue(undefined);

      await artistService.followArtists(artistIds);

      expect(mockApiClient.put).toHaveBeenCalledWith('/me/following', null, {
        params: { type: 'artist', ids: expectedIds }
      });
    });
  });

  describe('unfollowArtists', () => {
    it('should unfollow artists', async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await artistService.unfollowArtists(['artist1', 'artist2']);

      expect(mockApiClient.delete).toHaveBeenCalledWith('/me/following?type=artist&ids=artist1,artist2');
    });

    it('should limit artist IDs to maximum of 50 when unfollowing', async () => {
      const artistIds = Array.from({ length: 60 }, (_, i) => `artist${i}`);
      const expectedIds = artistIds.slice(0, 50).join(',');

      mockApiClient.delete.mockResolvedValue(undefined);

      await artistService.unfollowArtists(artistIds);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/me/following?type=artist&ids=${expectedIds}`);
    });
  });

  describe('checkFollowingArtists', () => {
    it('should check if following artists', async () => {
      const mockResponse = [true, false, true];

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await artistService.checkFollowingArtists(['artist1', 'artist2', 'artist3']);

      expect(mockApiClient.get).toHaveBeenCalledWith('/me/following/contains', {
        type: 'artist',
        ids: 'artist1,artist2,artist3'
      });
      expect(result).toEqual(mockResponse);
    });

    it('should limit artist IDs to maximum of 50 when checking following', async () => {
      const artistIds = Array.from({ length: 60 }, (_, i) => `artist${i}`);
      const expectedIds = artistIds.slice(0, 50).join(',');

      mockApiClient.get.mockResolvedValue([]);

      await artistService.checkFollowingArtists(artistIds);

      expect(mockApiClient.get).toHaveBeenCalledWith('/me/following/contains', {
        type: 'artist',
        ids: expectedIds
      });
    });
  });
});
