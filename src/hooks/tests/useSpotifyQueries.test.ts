import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import {
  usePlaylist,
  useAlbumTracks,
  useArtistAlbums,
  useRecentlyPlayed,
  useMadeForYouPlaylists,
  useFeaturedPlaylists,
} from '../useSpotifyQueries';

// Mock useSpotifyApi
const mockApi = {
  playlists: {
    getPlaylist: vi.fn(),
  },
  albums: {
    getAlbumTracks: vi.fn(),
  },
  artists: {
    getArtistAlbums: vi.fn(),
  },
  playback: {
    getRecentlyPlayedTracks: vi.fn(),
  },
  search: {
    search: vi.fn(),
  },
  getCurrentUserProfile: vi.fn(),
};

vi.mock('../useSpotifyApi', () => ({
  useSpotifyApi: vi.fn(),
}));

import { useSpotifyApi } from '../useSpotifyApi';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('usePlaylist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSpotifyApi).mockReturnValue(mockApi as never);
  });

  it('fetches a playlist by id', async () => {
    const mockPlaylist = { id: 'playlist1', name: 'My Playlist' };
    mockApi.playlists.getPlaylist.mockResolvedValue(mockPlaylist);

    const { result } = renderHook(() => usePlaylist('playlist1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.playlists.getPlaylist).toHaveBeenCalledWith('playlist1');
    expect(result.current.data).toEqual(mockPlaylist);
  });

  it('is disabled when api is null', () => {
    vi.mocked(useSpotifyApi).mockReturnValue(null);

    const { result } = renderHook(() => usePlaylist('playlist1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.playlists.getPlaylist).not.toHaveBeenCalled();
  });

  it('is disabled when playlistId is empty', () => {
    const { result } = renderHook(() => usePlaylist(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.playlists.getPlaylist).not.toHaveBeenCalled();
  });
});

describe('useAlbumTracks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSpotifyApi).mockReturnValue(mockApi as never);
  });

  it('fetches album tracks with default limit and offset', async () => {
    const mockTracks = { items: [], total: 0 };
    mockApi.albums.getAlbumTracks.mockResolvedValue(mockTracks);

    const { result } = renderHook(() => useAlbumTracks('album1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.albums.getAlbumTracks).toHaveBeenCalledWith('album1', {
      limit: 50,
      offset: 0,
    });
    expect(result.current.data).toEqual(mockTracks);
  });

  it('fetches album tracks with custom limit and offset', async () => {
    const mockTracks = { items: [], total: 0 };
    mockApi.albums.getAlbumTracks.mockResolvedValue(mockTracks);

    const { result } = renderHook(() => useAlbumTracks('album1', 25, 5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.albums.getAlbumTracks).toHaveBeenCalledWith('album1', {
      limit: 25,
      offset: 5,
    });
  });

  it('is disabled when albumId is empty', () => {
    const { result } = renderHook(() => useAlbumTracks(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.albums.getAlbumTracks).not.toHaveBeenCalled();
  });

  it('is disabled when api is null', () => {
    vi.mocked(useSpotifyApi).mockReturnValue(null);

    const { result } = renderHook(() => useAlbumTracks('album1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.albums.getAlbumTracks).not.toHaveBeenCalled();
  });
});

describe('useArtistAlbums', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSpotifyApi).mockReturnValue(mockApi as never);
  });

  it('fetches artist albums with default limit and offset', async () => {
    const mockAlbums = { items: [], total: 0 };
    mockApi.artists.getArtistAlbums.mockResolvedValue(mockAlbums);

    const { result } = renderHook(() => useArtistAlbums('artist1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.artists.getArtistAlbums).toHaveBeenCalledWith('artist1', {
      include_groups: 'album,single,compilation',
      limit: 10,
    });
    expect(result.current.data).toEqual(mockAlbums);
  });

  it('fetches artist albums with custom limit and offset', async () => {
    const mockAlbums = { items: [], total: 0 };
    mockApi.artists.getArtistAlbums.mockResolvedValue(mockAlbums);

    const { result } = renderHook(() => useArtistAlbums('artist1', 10, 20), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.artists.getArtistAlbums).toHaveBeenCalledWith('artist1', {
      include_groups: 'album,single,compilation',
      limit: 10,
      offset: 20,
    });
  });

  it('is disabled when artistId is empty', () => {
    const { result } = renderHook(() => useArtistAlbums(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.artists.getArtistAlbums).not.toHaveBeenCalled();
  });
});

describe('useRecentlyPlayed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSpotifyApi).mockReturnValue(mockApi as never);
  });

  it('fetches recently played tracks with default limit', async () => {
    const mockData = { items: [], cursors: {}, href: '', limit: 20 };
    mockApi.playback.getRecentlyPlayedTracks.mockResolvedValue(mockData);

    const { result } = renderHook(() => useRecentlyPlayed(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.playback.getRecentlyPlayedTracks).toHaveBeenCalledWith({ limit: 20 });
    expect(result.current.data).toEqual(mockData);
  });

  it('fetches recently played tracks with custom limit', async () => {
    const mockData = { items: [], cursors: {}, href: '', limit: 5 };
    mockApi.playback.getRecentlyPlayedTracks.mockResolvedValue(mockData);

    const { result } = renderHook(() => useRecentlyPlayed(5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.playback.getRecentlyPlayedTracks).toHaveBeenCalledWith({ limit: 5 });
  });

  it('is disabled when api is null', () => {
    vi.mocked(useSpotifyApi).mockReturnValue(null);

    const { result } = renderHook(() => useRecentlyPlayed(), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.playback.getRecentlyPlayedTracks).not.toHaveBeenCalled();
  });
});

describe('useMadeForYouPlaylists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSpotifyApi).mockReturnValue(mockApi as never);
    mockApi.getCurrentUserProfile.mockResolvedValue({ country: 'US' });
  });

  it('calls search with "for me" and playlist type', async () => {
    const mockResult = { playlists: { items: [{ id: 'p1' }], total: 1 } };
    mockApi.search.search.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useMadeForYouPlaylists(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.search.search).toHaveBeenCalledWith('for me', ['playlist'], { market: 'US' });
    expect(result.current.data).toEqual(mockResult);
  });

  it('respects custom limit', async () => {
    const mockResult = { playlists: { items: [], total: 0 } };
    mockApi.search.search.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useMadeForYouPlaylists(10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.search.search).toHaveBeenCalledWith('for me', ['playlist'], { market: 'US' });
  });

  it('is disabled when api is null', () => {
    vi.mocked(useSpotifyApi).mockReturnValue(null);

    const { result } = renderHook(() => useMadeForYouPlaylists(), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.search.search).not.toHaveBeenCalled();
  });
});

describe('useFeaturedPlaylists (search-based)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSpotifyApi).mockReturnValue(mockApi as never);
    mockApi.getCurrentUserProfile.mockResolvedValue({ country: 'US' });
  });

  it('calls search with "featured" and playlist type', async () => {
    const mockResult = { playlists: { items: [{ id: 'p2' }], total: 1 } };
    mockApi.search.search.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useFeaturedPlaylists(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.search.search).toHaveBeenCalledWith('featured', ['playlist'], { market: 'US' });
    expect(result.current.data).toEqual(mockResult);
  });

  it('respects custom limit', async () => {
    const mockResult = { playlists: { items: [], total: 0 } };
    mockApi.search.search.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useFeaturedPlaylists(10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.search.search).toHaveBeenCalledWith('featured', ['playlist'], { market: 'US' });
  });

  it('is disabled when api is null', () => {
    vi.mocked(useSpotifyApi).mockReturnValue(null);

    const { result } = renderHook(() => useFeaturedPlaylists(), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.search.search).not.toHaveBeenCalled();
  });
});
