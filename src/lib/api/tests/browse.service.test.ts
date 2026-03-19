import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowseService } from '../browse.service';
import { SpotifyApiClient } from '../base.service';

// Mock SpotifyApiClient
vi.mock('../base.service');

describe('BrowseService', () => {
  let browseService: BrowseService;
  let mockApiClient: {
    get: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn()
    };
    browseService = new BrowseService(mockApiClient as unknown as SpotifyApiClient);
  });

  describe('getCategories', () => {
    it('should get categories without options', async () => {
      const mockResponse = {
        categories: {
          href: 'https://api.spotify.com/v1/browse/categories',
          items: [],
          limit: 20,
          offset: 0,
          total: 50
        }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await browseService.getCategories();

      expect(mockApiClient.get).toHaveBeenCalledWith('/browse/categories', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should get categories with options', async () => {
      const options = {
        country: 'US',
        locale: 'en_US',
        limit: 10,
        offset: 5
      };
      const mockResponse = {
        categories: {
          href: 'https://api.spotify.com/v1/browse/categories',
          items: [],
          limit: 10,
          offset: 5,
          total: 50
        }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await browseService.getCategories(options);

      expect(mockApiClient.get).toHaveBeenCalledWith('/browse/categories', options);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCategory', () => {
    it('should get specific category without options', async () => {
      const categoryId = 'party';
      const mockResponse = {
        href: 'https://api.spotify.com/v1/browse/categories/party',
        id: 'party',
        name: 'Party',
        icons: []
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await browseService.getCategory(categoryId);

      expect(mockApiClient.get).toHaveBeenCalledWith('/browse/categories/party', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should get specific category with options', async () => {
      const categoryId = 'rock';
      const options = {
        country: 'GB',
        locale: 'en_GB'
      };
      const mockResponse = {
        href: 'https://api.spotify.com/v1/browse/categories/rock',
        id: 'rock',
        name: 'Rock',
        icons: []
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await browseService.getCategory(categoryId, options);

      expect(mockApiClient.get).toHaveBeenCalledWith('/browse/categories/rock', options);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCategoryPlaylists', () => {
    it('should get category playlists without options', async () => {
      const categoryId = 'jazz';
      const mockResponse = {
        message: 'Jazz Playlists',
        playlists: {
          href: 'https://api.spotify.com/v1/browse/categories/jazz/playlists',
          items: [],
          limit: 20,
          offset: 0,
          total: 100
        }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await browseService.getCategoryPlaylists(categoryId);

      expect(mockApiClient.get).toHaveBeenCalledWith('/browse/categories/jazz/playlists', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should get category playlists with options', async () => {
      const categoryId = 'pop';
      const options = {
        country: 'CA',
        limit: 15,
        offset: 10
      };
      const mockResponse = {
        playlists: {
          href: 'https://api.spotify.com/v1/browse/categories/pop/playlists',
          items: [],
          limit: 15,
          offset: 10,
          total: 200
        }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await browseService.getCategoryPlaylists(categoryId, options);

      expect(mockApiClient.get).toHaveBeenCalledWith('/browse/categories/pop/playlists', options);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getFeaturedPlaylists', () => {
    it('should get featured playlists without options', async () => {
      const mockResponse = {
        message: 'Monday Morning Music',
        playlists: {
          href: 'https://api.spotify.com/v1/browse/featured-playlists',
          items: [],
          limit: 20,
          offset: 0,
          total: 50
        }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await browseService.getFeaturedPlaylists();

      expect(mockApiClient.get).toHaveBeenCalledWith('/browse/featured-playlists', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should get featured playlists with options', async () => {
      const options = {
        country: 'SE',
        limit: 30,
        offset: 20,
        timestamp: '2021-10-23T09:00:00'
      };
      const mockResponse = {
        message: 'Featured Playlists',
        playlists: {
          href: 'https://api.spotify.com/v1/browse/featured-playlists',
          items: [],
          limit: 30,
          offset: 20,
          total: 100
        }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await browseService.getFeaturedPlaylists(options);

      expect(mockApiClient.get).toHaveBeenCalledWith('/browse/featured-playlists', options);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getNewReleases', () => {
    it('should get new releases without options', async () => {
      const mockResponse = {
        message: 'New Releases',
        albums: {
          href: 'https://api.spotify.com/v1/browse/new-releases',
          items: [],
          limit: 20,
          offset: 0,
          total: 100
        }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await browseService.getNewReleases();

      expect(mockApiClient.get).toHaveBeenCalledWith('/browse/new-releases', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should get new releases with options', async () => {
      const options = {
        country: 'DE',
        limit: 25,
        offset: 15
      };
      const mockResponse = {
        message: 'New Releases',
        albums: {
          href: 'https://api.spotify.com/v1/browse/new-releases',
          items: [],
          limit: 25,
          offset: 15,
          total: 150
        }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await browseService.getNewReleases(options);

      expect(mockApiClient.get).toHaveBeenCalledWith('/browse/new-releases', options);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAvailableGenreSeeds', () => {
    it('should get available genre seeds', async () => {
      const mockResponse = {
        genres: ['rock', 'pop', 'jazz', 'classical', 'hip-hop']
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await browseService.getAvailableGenreSeeds();

      expect(mockApiClient.get).toHaveBeenCalledWith('/recommendations/available-genre-seeds');
      expect(result).toEqual(mockResponse);
    });
  });
});
