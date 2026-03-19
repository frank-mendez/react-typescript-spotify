import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { TrackService } from '../track.service';
import type { Track, UserSavedTracks, AudioFeatures, Recommendations } from '../../../data-objects/interface';

// Mock the base service
vi.mock('../base.service');

describe('TrackService', () => {
  let trackService: TrackService;
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
    trackService = new TrackService(mockApiClient as any);
  });

  describe('getTrack', () => {
    it('should get a single track by ID without market', async () => {
      const mockTrack: Track = {
        id: 'track123',
        name: 'Test Track',
        type: 'track',
        uri: 'spotify:track:track123',
        href: 'https://api.spotify.com/v1/tracks/track123',
        external_urls: { spotify: 'https://open.spotify.com/track/track123' },
        popularity: 80,
        preview_url: 'https://preview.url',
        track_number: 1,
        disc_number: 1,
        duration_ms: 180000,
        explicit: false,
        is_playable: true,
        is_local: false,
        artists: [],
        album: {} as any
      };

      mockApiClient.get.mockResolvedValue(mockTrack);

      const result = await trackService.getTrack('track123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/tracks/track123', {});
      expect(result).toEqual(mockTrack);
    });

    it('should get a single track by ID with market', async () => {
      const mockTrack: Track = {
        id: 'track123',
        name: 'Test Track'
      } as Track;

      mockApiClient.get.mockResolvedValue(mockTrack);

      const result = await trackService.getTrack('track123', 'US');

      expect(mockApiClient.get).toHaveBeenCalledWith('/tracks/track123', { market: 'US' });
      expect(result).toEqual(mockTrack);
    });
  });

  describe('getTracks', () => {
    it('should get multiple tracks by IDs without market', async () => {
      const mockResponse = {
        tracks: [
          { id: 'track1', name: 'Track 1' },
          { id: 'track2', name: 'Track 2' }
        ]
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await trackService.getTracks(['track1', 'track2']);

      expect(mockApiClient.get).toHaveBeenCalledWith('/tracks', { ids: 'track1,track2' });
      expect(result).toEqual(mockResponse);
    });

    it('should get multiple tracks by IDs with market', async () => {
      const mockResponse = {
        tracks: [{ id: 'track1', name: 'Track 1' }]
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await trackService.getTracks(['track1'], 'GB');

      expect(mockApiClient.get).toHaveBeenCalledWith('/tracks', { ids: 'track1', market: 'GB' });
      expect(result).toEqual(mockResponse);
    });

    it('should limit track IDs to maximum of 50', async () => {
      const trackIds = Array.from({ length: 60 }, (_, i) => `track${i}`);
      const expectedIds = trackIds.slice(0, 50).join(',');

      mockApiClient.get.mockResolvedValue({ tracks: [] });

      await trackService.getTracks(trackIds);

      expect(mockApiClient.get).toHaveBeenCalledWith('/tracks', { ids: expectedIds });
    });
  });

  describe('getUserSavedTracks', () => {
    it('should get user saved tracks without options', async () => {
      const mockTracks: UserSavedTracks = {
        href: 'https://api.spotify.com/v1/me/tracks',
        items: [],
        limit: 20,
        next: undefined,
        offset: 0,
        previous: undefined,
        total: 0
      };

      mockApiClient.get.mockResolvedValue(mockTracks);

      const result = await trackService.getUserSavedTracks();

      expect(mockApiClient.get).toHaveBeenCalledWith('/me/tracks', undefined);
      expect(result).toEqual(mockTracks);
    });

    it('should get user saved tracks with options', async () => {
      const options = {
        market: 'US',
        limit: 10,
        offset: 20
      };

      mockApiClient.get.mockResolvedValue({ items: [] });

      await trackService.getUserSavedTracks(options);

      expect(mockApiClient.get).toHaveBeenCalledWith('/me/tracks', options);
    });
  });

  describe('saveTracks', () => {
    it('should save tracks', async () => {
      mockApiClient.put.mockResolvedValue(undefined);

      await trackService.saveTracks(['track1', 'track2']);

      expect(mockApiClient.put).toHaveBeenCalledWith('/me/tracks', null, {
        params: { ids: 'track1,track2' }
      });
    });

    it('should limit track IDs to maximum of 50 when saving', async () => {
      const trackIds = Array.from({ length: 60 }, (_, i) => `track${i}`);
      const expectedIds = trackIds.slice(0, 50).join(',');

      mockApiClient.put.mockResolvedValue(undefined);

      await trackService.saveTracks(trackIds);

      expect(mockApiClient.put).toHaveBeenCalledWith('/me/tracks', null, {
        params: { ids: expectedIds }
      });
    });
  });

  describe('removeTracks', () => {
    it('should remove tracks', async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await trackService.removeTracks(['track1', 'track2']);

      expect(mockApiClient.delete).toHaveBeenCalledWith('/me/tracks?ids=track1,track2');
    });

    it('should limit track IDs to maximum of 50 when removing', async () => {
      const trackIds = Array.from({ length: 60 }, (_, i) => `track${i}`);
      const expectedIds = trackIds.slice(0, 50).join(',');

      mockApiClient.delete.mockResolvedValue(undefined);

      await trackService.removeTracks(trackIds);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/me/tracks?ids=${expectedIds}`);
    });
  });

  describe('checkSavedTracks', () => {
    it('should check if tracks are saved', async () => {
      const mockResponse = [true, false, true];

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await trackService.checkSavedTracks(['track1', 'track2', 'track3']);

      expect(mockApiClient.get).toHaveBeenCalledWith('/me/tracks/contains', { ids: 'track1,track2,track3' });
      expect(result).toEqual(mockResponse);
    });

    it('should limit track IDs to maximum of 50 when checking', async () => {
      const trackIds = Array.from({ length: 60 }, (_, i) => `track${i}`);
      const expectedIds = trackIds.slice(0, 50).join(',');

      mockApiClient.get.mockResolvedValue([]);

      await trackService.checkSavedTracks(trackIds);

      expect(mockApiClient.get).toHaveBeenCalledWith('/me/tracks/contains', { ids: expectedIds });
    });
  });

  describe('getTrackAudioFeatures', () => {
    it('should get audio features for a single track', async () => {
      const mockFeatures: AudioFeatures = {
        id: 'track123',
        acousticness: 0.5,
        danceability: 0.7,
        duration_ms: 180000,
        energy: 0.8,
        instrumentalness: 0.1,
        key: 5,
        liveness: 0.2,
        loudness: -5.5,
        mode: 1,
        speechiness: 0.05,
        tempo: 120.0,
        time_signature: 4,
        valence: 0.6,
        analysis_url: 'https://analysis.url',
        track_href: 'https://api.spotify.com/v1/tracks/track123',
        type: 'audio_features',
        uri: 'spotify:track:track123'
      };

      mockApiClient.get.mockResolvedValue(mockFeatures);

      const result = await trackService.getTrackAudioFeatures('track123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/audio-features/track123');
      expect(result).toEqual(mockFeatures);
    });
  });

  describe('getTracksAudioFeatures', () => {
    it('should get audio features for multiple tracks', async () => {
      const mockResponse = {
        audio_features: [
          { id: 'track1', acousticness: 0.5 },
          { id: 'track2', acousticness: 0.3 }
        ]
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await trackService.getTracksAudioFeatures(['track1', 'track2']);

      expect(mockApiClient.get).toHaveBeenCalledWith('/audio-features', { ids: 'track1,track2' });
      expect(result).toEqual(mockResponse);
    });

    it('should limit track IDs to maximum of 100 for audio features', async () => {
      const trackIds = Array.from({ length: 120 }, (_, i) => `track${i}`);
      const expectedIds = trackIds.slice(0, 100).join(',');

      mockApiClient.get.mockResolvedValue({ audio_features: [] });

      await trackService.getTracksAudioFeatures(trackIds);

      expect(mockApiClient.get).toHaveBeenCalledWith('/audio-features', { ids: expectedIds });
    });
  });

  describe('getRecommendations', () => {
    it('should get recommendations with seed artists', async () => {
      const mockRecommendations: Recommendations = {
        tracks: [],
        seeds: []
      };

      mockApiClient.get.mockResolvedValue(mockRecommendations);

      const options = {
        seed_artists: ['artist1', 'artist2'],
        limit: 10
      };

      const result = await trackService.getRecommendations(options);

      expect(mockApiClient.get).toHaveBeenCalledWith('/recommendations', {
        seed_artists: 'artist1,artist2',
        limit: 10
      });
      expect(result).toEqual(mockRecommendations);
    });

    it('should get recommendations with seed tracks', async () => {
      mockApiClient.get.mockResolvedValue({ tracks: [], seeds: [] });

      const options = {
        seed_tracks: ['track1', 'track2'],
        target_energy: 0.8
      };

      await trackService.getRecommendations(options);

      expect(mockApiClient.get).toHaveBeenCalledWith('/recommendations', {
        seed_tracks: 'track1,track2',
        target_energy: 0.8
      });
    });

    it('should get recommendations with seed genres', async () => {
      mockApiClient.get.mockResolvedValue({ tracks: [], seeds: [] });

      const options = {
        seed_genres: ['rock', 'pop'],
        market: 'US'
      };

      await trackService.getRecommendations(options);

      expect(mockApiClient.get).toHaveBeenCalledWith('/recommendations', {
        seed_genres: 'rock,pop',
        market: 'US'
      });
    });

    it('should get recommendations with mixed seeds', async () => {
      mockApiClient.get.mockResolvedValue({ tracks: [], seeds: [] });

      const options = {
        seed_artists: ['artist1'],
        seed_tracks: ['track1'],
        seed_genres: ['rock'],
        min_energy: 0.5,
        max_tempo: 140
      };

      await trackService.getRecommendations(options);

      expect(mockApiClient.get).toHaveBeenCalledWith('/recommendations', {
        seed_artists: 'artist1',
        seed_tracks: 'track1',
        seed_genres: 'rock',
        min_energy: 0.5,
        max_tempo: 140
      });
    });

    it('should throw error when no seeds provided', async () => {
      const options = {
        limit: 10
      };

      await expect(trackService.getRecommendations(options))
        .rejects.toThrow('At least one seed must be provided');
    });

    it('should throw error when more than 5 seeds provided', async () => {
      const options = {
        seed_artists: ['artist1', 'artist2', 'artist3'],
        seed_tracks: ['track1', 'track2'],
        seed_genres: ['rock']
      };

      await expect(trackService.getRecommendations(options))
        .rejects.toThrow('Maximum of 5 seeds allowed in total');
    });
  });

  describe('getAvailableGenreSeeds', () => {
    it('should get available genre seeds', async () => {
      const mockGenres = {
        genres: ['rock', 'pop', 'jazz', 'classical', 'electronic']
      };

      mockApiClient.get.mockResolvedValue(mockGenres);

      const result = await trackService.getAvailableGenreSeeds();

      expect(mockApiClient.get).toHaveBeenCalledWith('/recommendations/available-genre-seeds');
      expect(result).toEqual(mockGenres);
    });
  });
});
