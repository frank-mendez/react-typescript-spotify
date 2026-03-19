import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlbumService } from '../album.service';
import { SpotifyApiClient } from '../base.service';

// Mock the SpotifyApiClient
vi.mock('../base.service', () => ({
  SpotifyApiClient: vi.fn()
}));

describe('AlbumService', () => {
  let albumService: AlbumService;
  let mockApiClient: {
    get: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };
    
    albumService = new AlbumService(mockApiClient as unknown as SpotifyApiClient);
  });

  describe('getAlbum', () => {
    it('should get a single album without market', async () => {
      const mockAlbum = {
        id: 'album1',
        name: 'Test Album',
        artists: [{ id: 'artist1', name: 'Test Artist' }]
      };
      mockApiClient.get.mockResolvedValue(mockAlbum);

      const result = await albumService.getAlbum('album1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/albums/album1', {});
      expect(result).toEqual(mockAlbum);
    });

    it('should get a single album with market', async () => {
      const mockAlbum = {
        id: 'album1',
        name: 'Test Album',
        artists: [{ id: 'artist1', name: 'Test Artist' }]
      };
      mockApiClient.get.mockResolvedValue(mockAlbum);

      const result = await albumService.getAlbum('album1', 'US');

      expect(mockApiClient.get).toHaveBeenCalledWith('/albums/album1', { market: 'US' });
      expect(result).toEqual(mockAlbum);
    });
  });

  describe('getAlbums', () => {
    it('should get multiple albums without market', async () => {
      const mockAlbums = {
        albums: [
          { id: 'album1', name: 'Album 1' },
          { id: 'album2', name: 'Album 2' }
        ]
      };
      mockApiClient.get.mockResolvedValue(mockAlbums);

      const result = await albumService.getAlbums(['album1', 'album2']);

      expect(mockApiClient.get).toHaveBeenCalledWith('/albums', { ids: 'album1,album2' });
      expect(result).toEqual(mockAlbums);
    });

    it('should get multiple albums with market', async () => {
      const mockAlbums = {
        albums: [
          { id: 'album1', name: 'Album 1' }
        ]
      };
      mockApiClient.get.mockResolvedValue(mockAlbums);

      const result = await albumService.getAlbums(['album1'], 'GB');

      expect(mockApiClient.get).toHaveBeenCalledWith('/albums', { ids: 'album1', market: 'GB' });
      expect(result).toEqual(mockAlbums);
    });

    it('should limit albums to maximum of 20', async () => {
      const albumIds = Array.from({ length: 25 }, (_, i) => `album${i + 1}`);
      const expectedIds = albumIds.slice(0, 20).join(',');
      const mockAlbums = { albums: [] };
      mockApiClient.get.mockResolvedValue(mockAlbums);

      await albumService.getAlbums(albumIds);

      expect(mockApiClient.get).toHaveBeenCalledWith('/albums', { ids: expectedIds });
    });
  });

  describe('getAlbumTracks', () => {
    it('should get album tracks without options', async () => {
      const mockTracks = {
        items: [
          { id: 'track1', name: 'Track 1' },
          { id: 'track2', name: 'Track 2' }
        ]
      };
      mockApiClient.get.mockResolvedValue(mockTracks);

      const result = await albumService.getAlbumTracks('album1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/albums/album1/tracks', undefined);
      expect(result).toEqual(mockTracks);
    });

    it('should get album tracks with options', async () => {
      const mockTracks = {
        items: [{ id: 'track1', name: 'Track 1' }],
        total: 1,
        limit: 10,
        offset: 0
      };
      mockApiClient.get.mockResolvedValue(mockTracks);

      const options = {
        market: 'US',
        limit: 10,
        offset: 0
      };

      const result = await albumService.getAlbumTracks('album1', options);

      expect(mockApiClient.get).toHaveBeenCalledWith('/albums/album1/tracks', options);
      expect(result).toEqual(mockTracks);
    });
  });

  describe('getUserSavedAlbums', () => {
    it('should get user saved albums without options', async () => {
      const mockSavedAlbums = {
        items: [
          { added_at: '2023-01-01', album: { id: 'album1', name: 'Saved Album' } }
        ]
      };
      mockApiClient.get.mockResolvedValue(mockSavedAlbums);

      const result = await albumService.getUserSavedAlbums();

      expect(mockApiClient.get).toHaveBeenCalledWith('/me/albums', undefined);
      expect(result).toEqual(mockSavedAlbums);
    });

    it('should get user saved albums with options', async () => {
      const mockSavedAlbums = {
        items: [],
        total: 0,
        limit: 20,
        offset: 0
      };
      mockApiClient.get.mockResolvedValue(mockSavedAlbums);

      const options = {
        limit: 20,
        offset: 0,
        market: 'CA'
      };

      const result = await albumService.getUserSavedAlbums(options);

      expect(mockApiClient.get).toHaveBeenCalledWith('/me/albums', options);
      expect(result).toEqual(mockSavedAlbums);
    });
  });

  describe('saveAlbums', () => {
    it('should save albums to user library', async () => {
      mockApiClient.put.mockResolvedValue(undefined);

      await albumService.saveAlbums(['album1', 'album2']);

      expect(mockApiClient.put).toHaveBeenCalledWith('/me/albums', null, {
        params: { ids: 'album1,album2' }
      });
    });

    it('should limit albums to maximum of 50', async () => {
      const albumIds = Array.from({ length: 55 }, (_, i) => `album${i + 1}`);
      const expectedIds = albumIds.slice(0, 50).join(',');
      mockApiClient.put.mockResolvedValue(undefined);

      await albumService.saveAlbums(albumIds);

      expect(mockApiClient.put).toHaveBeenCalledWith('/me/albums', null, {
        params: { ids: expectedIds }
      });
    });
  });

  describe('removeAlbums', () => {
    it('should remove albums from user library', async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await albumService.removeAlbums(['album1', 'album2']);

      expect(mockApiClient.delete).toHaveBeenCalledWith('/me/albums?ids=album1,album2');
    });

    it('should limit albums to maximum of 50', async () => {
      const albumIds = Array.from({ length: 60 }, (_, i) => `album${i + 1}`);
      const expectedIds = albumIds.slice(0, 50).join(',');
      mockApiClient.delete.mockResolvedValue(undefined);

      await albumService.removeAlbums(albumIds);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/me/albums?ids=${expectedIds}`);
    });
  });

  describe('checkSavedAlbums', () => {
    it('should check if albums are saved', async () => {
      const mockResponse = [true, false, true];
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await albumService.checkSavedAlbums(['album1', 'album2', 'album3']);

      expect(mockApiClient.get).toHaveBeenCalledWith('/me/albums/contains', { ids: 'album1,album2,album3' });
      expect(result).toEqual(mockResponse);
    });

    it('should limit albums to maximum of 50', async () => {
      const albumIds = Array.from({ length: 60 }, (_, i) => `album${i + 1}`);
      const expectedIds = albumIds.slice(0, 50).join(',');
      const mockResponse = Array.from({ length: 50 }, () => false);
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await albumService.checkSavedAlbums(albumIds);

      expect(mockApiClient.get).toHaveBeenCalledWith('/me/albums/contains', { ids: expectedIds });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getNewReleases', () => {
    it('should get new releases without options', async () => {
      const mockNewReleases = {
        albums: {
          items: [
            { id: 'new-album1', name: 'New Release 1' }
          ]
        }
      };
      mockApiClient.get.mockResolvedValue(mockNewReleases);

      const result = await albumService.getNewReleases();

      expect(mockApiClient.get).toHaveBeenCalledWith('/browse/new-releases', undefined);
      expect(result).toEqual(mockNewReleases);
    });

    it('should get new releases with options', async () => {
      const mockNewReleases = {
        albums: {
          items: [],
          total: 0,
          limit: 30,
          offset: 10
        }
      };
      mockApiClient.get.mockResolvedValue(mockNewReleases);

      const options = {
        country: 'DE',
        limit: 30,
        offset: 10
      };

      const result = await albumService.getNewReleases(options);

      expect(mockApiClient.get).toHaveBeenCalledWith('/browse/new-releases', options);
      expect(result).toEqual(mockNewReleases);
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      const apiError = new Error('Album not found');
      mockApiClient.get.mockRejectedValue(apiError);

      await expect(albumService.getAlbum('invalid-id')).rejects.toThrow('Album not found');
    });
  });
});
