import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { RecentlyPlayedSection } from './RecentlyPlayedSection';

// Mock hooks
vi.mock('../../../hooks/useSpotifyQueries', () => ({
  useRecentlyPlayed: vi.fn(),
}));

vi.mock('../../../hooks/useSpotifyMutations', () => ({
  usePlaybackControls: vi.fn(() => ({
    play: { mutate: vi.fn() },
  })),
}));

import { useRecentlyPlayed } from '../../../hooks/useSpotifyQueries';

const makeTrack = (id: string, albumId: string, artistId: string) => ({
  track: {
    id,
    name: `Track ${id}`,
    uri: `spotify:track:${id}`,
    artists: [{
      id: artistId,
      name: `Artist ${artistId}`,
      type: 'artist' as const,
      href: '',
      uri: `spotify:artist:${artistId}`,
      external_urls: { spotify: '' },
    }],
    album: {
      id: albumId,
      name: `Album ${albumId}`,
      uri: `spotify:album:${albumId}`,
      images: [{ url: `https://img/${albumId}.jpg` }],
      album_type: 'album' as const,
      total_tracks: 10,
      href: '',
      release_date: '2024-01-01',
      release_date_precision: 'day' as const,
      type: 'album' as const,
      external_urls: { spotify: '' },
      artists: [],
    },
    disc_number: 1,
    duration_ms: 200000,
    explicit: false,
    external_urls: { spotify: '' },
    href: '',
    is_local: false,
    popularity: 80,
    track_number: 1,
    type: 'track' as const,
  },
  played_at: '2024-01-01T00:00:00Z',
});

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc },
    createElement(MemoryRouter, null, children)
  );
}

describe('RecentlyPlayedSection', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders skeleton pills while loading (no section title)', () => {
    vi.mocked(useRecentlyPlayed).mockReturnValue({ isLoading: true, data: undefined } as never);
    const { container } = render(<RecentlyPlayedSection />, { wrapper });
    expect(screen.queryByText('Recently Played')).not.toBeInTheDocument();
    expect(container.firstChild).toBeTruthy(); // skeleton grid is rendered
  });

  it('renders nothing when data is undefined (error state)', () => {
    vi.mocked(useRecentlyPlayed).mockReturnValue({ isLoading: false, data: undefined } as never);
    const { container } = render(<RecentlyPlayedSection />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when data is empty', () => {
    vi.mocked(useRecentlyPlayed).mockReturnValue({
      isLoading: false,
      data: { items: [], cursors: {}, href: '', limit: 20 },
    } as never);
    const { container } = render(<RecentlyPlayedSection />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('renders section title and cards when data is present', () => {
    vi.mocked(useRecentlyPlayed).mockReturnValue({
      isLoading: false,
      data: { items: [makeTrack('t1', 'a1', 'ar1')], cursors: {}, href: '', limit: 20 },
    } as never);
    render(<RecentlyPlayedSection />, { wrapper });
    expect(screen.getByText('Recently Played')).toBeInTheDocument();
    expect(screen.getByText('Album a1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /play artist ar1/i })).toBeInTheDocument();
  });

  it('deduplicates albums across tracks', () => {
    const items = [
      makeTrack('t1', 'same-album', 'ar1'),
      makeTrack('t2', 'same-album', 'ar2'),
    ];
    vi.mocked(useRecentlyPlayed).mockReturnValue({
      isLoading: false,
      data: { items, cursors: {}, href: '', limit: 20 },
    } as never);
    render(<RecentlyPlayedSection />, { wrapper });
    // 'Album same-album' should appear only once
    expect(screen.getAllByText('Album same-album')).toHaveLength(1);
  });

  it('deduplicates artists across tracks', () => {
    const items = [
      makeTrack('t1', 'al1', 'same-artist'),
      makeTrack('t2', 'al2', 'same-artist'),
    ];
    vi.mocked(useRecentlyPlayed).mockReturnValue({
      isLoading: false,
      data: { items, cursors: {}, href: '', limit: 20 },
    } as never);
    render(<RecentlyPlayedSection />, { wrapper });
    // The artist name may appear in album subtitles too; verify the artist card is deduplicated
    expect(screen.getAllByRole('button', { name: /play artist same-artist/i })).toHaveLength(1);
  });

  it('caps output at 8 items', () => {
    // 6 unique tracks, each with unique album+artist → up to 12 items, capped at 8
    const items = Array.from({ length: 6 }, (_, i) =>
      makeTrack(`t${i}`, `al${i}`, `ar${i}`)
    );
    vi.mocked(useRecentlyPlayed).mockReturnValue({
      isLoading: false,
      data: { items, cursors: {}, href: '', limit: 20 },
    } as never);
    render(<RecentlyPlayedSection />, { wrapper });
    const playButtons = screen.getAllByRole('button', { name: /play/i });
    expect(playButtons).toHaveLength(8);
  });

  it('still emits artist when track.album is absent', () => {
    const trackNoAlbum = makeTrack('t1', 'al1', 'ar1');
    (trackNoAlbum.track as { album?: unknown }).album = undefined;
    vi.mocked(useRecentlyPlayed).mockReturnValue({
      isLoading: false,
      data: { items: [trackNoAlbum], cursors: {}, href: '', limit: 20 },
    } as never);
    render(<RecentlyPlayedSection />, { wrapper });
    expect(screen.getByText('Artist ar1')).toBeInTheDocument();
  });
});
