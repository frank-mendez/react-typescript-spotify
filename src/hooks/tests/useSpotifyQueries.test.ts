import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import {
  usePlaylist,
  usePlaylistItems,
  useAlbumTracks,
  useArtistTopTracks,
  useArtistAlbums,
} from '../useSpotifyQueries';

// Mock useSpotifyApi
const mockApi = {
  playlists: {
    getPlaylist: vi.fn(),
    getPlaylistItems: vi.fn(),
  },
  albums: {
    getAlbumTracks: vi.fn(),
  },
  artists: {
    getArtistTopTracks: vi.fn(),
    getArtistAlbums: vi.fn(),
  },
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

describe('usePlaylistItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSpotifyApi).mockReturnValue(mockApi as never);
  });

  it('fetches playlist items with default limit and offset', async () => {
    const mockItems = { items: [], total: 0 };
    mockApi.playlists.getPlaylistItems.mockResolvedValue(mockItems);

    const { result } = renderHook(() => usePlaylistItems('playlist1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.playlists.getPlaylistItems).toHaveBeenCalledWith('playlist1', {
      limit: 50,
      offset: 0,
    });
    expect(result.current.data).toEqual(mockItems);
  });

  it('fetches playlist items with custom limit and offset', async () => {
    const mockItems = { items: [], total: 0 };
    mockApi.playlists.getPlaylistItems.mockResolvedValue(mockItems);

    const { result } = renderHook(() => usePlaylistItems('playlist1', 20, 10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.playlists.getPlaylistItems).toHaveBeenCalledWith('playlist1', {
      limit: 20,
      offset: 10,
    });
  });

  it('is disabled when api is null', () => {
    vi.mocked(useSpotifyApi).mockReturnValue(null);

    const { result } = renderHook(() => usePlaylistItems('playlist1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.playlists.getPlaylistItems).not.toHaveBeenCalled();
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
});

describe('useArtistTopTracks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSpotifyApi).mockReturnValue(mockApi as never);
  });

  it('fetches artist top tracks', async () => {
    const mockTracks = { tracks: [] };
    mockApi.artists.getArtistTopTracks.mockResolvedValue(mockTracks);

    const { result } = renderHook(() => useArtistTopTracks('artist1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.artists.getArtistTopTracks).toHaveBeenCalledWith('artist1');
    expect(result.current.data).toEqual(mockTracks);
  });

  it('is disabled when api is null', () => {
    vi.mocked(useSpotifyApi).mockReturnValue(null);

    const { result } = renderHook(() => useArtistTopTracks('artist1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.artists.getArtistTopTracks).not.toHaveBeenCalled();
  });

  it('is disabled when artistId is empty', () => {
    const { result } = renderHook(() => useArtistTopTracks(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.artists.getArtistTopTracks).not.toHaveBeenCalled();
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
      limit: 20,
      offset: 0,
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
