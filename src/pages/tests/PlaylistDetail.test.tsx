import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PlaylistDetail from '../PlaylistDetail';

// ---- Module mocks ----

const mockUsePlaylist = vi.fn();
const mockUsePlaylistItems = vi.fn();
const mockUseCurrentlyPlaying = vi.fn();
const mockPlayMutate = vi.fn();

vi.mock('../../hooks/useSpotifyQueries', () => ({
  usePlaylist: (...args: unknown[]) => mockUsePlaylist(...args),
  usePlaylistItems: (...args: unknown[]) => mockUsePlaylistItems(...args),
  useCurrentlyPlaying: () => mockUseCurrentlyPlaying(),
}));

vi.mock('../../hooks/useSpotifyMutations', () => ({
  usePlaybackControls: () => ({
    play: { mutate: mockPlayMutate },
  }),
}));

// ---- Test helpers ----

const mockPlaylist = {
  id: 'pl1',
  name: 'My Test Playlist',
  uri: 'spotify:playlist:pl1',
  description: 'A test playlist',
  images: [{ url: 'http://img.test/cover.jpg' }],
  owner: { display_name: 'Test User' },
  tracks: { total: 2, href: '' },
  collaborative: false,
  external_urls: { spotify: '' },
  followers: { total: 0 },
  href: '',
  snapshot_id: 'snap1',
  type: 'playlist' as const,
  uri2: '',
};

const makeTrackItem = (overrides: { id: string; name: string; artistId?: string; artistName?: string; albumId?: string; albumName?: string; durationMs?: number }) => ({
  added_at: '2024-01-01T00:00:00Z',
  added_by: { external_urls: { spotify: '' }, href: '', id: 'user1', type: 'user' as const, uri: '' },
  is_local: false,
  track: {
    id: overrides.id,
    name: overrides.name,
    uri: `spotify:track:${overrides.id}`,
    duration_ms: overrides.durationMs ?? 210000,
    explicit: false,
    disc_number: 1,
    track_number: 1,
    href: '',
    is_local: false,
    popularity: 70,
    type: 'track' as const,
    external_urls: { spotify: '' },
    artists: [
      {
        id: overrides.artistId ?? 'artist1',
        name: overrides.artistName ?? 'Test Artist',
        type: 'artist' as const,
        href: '',
        uri: '',
        external_urls: { spotify: '' },
      },
    ],
    album: {
      id: overrides.albumId ?? 'album1',
      name: overrides.albumName ?? 'Test Album',
      images: [{ url: 'http://img.test/art.jpg' }],
      album_type: 'album' as const,
      total_tracks: 10,
      href: '',
      uri: '',
      external_urls: { spotify: '' },
      release_date: '2024-01-01',
      release_date_precision: 'day' as const,
      type: 'album' as const,
      artists: [],
    },
  },
});

function renderWithRouter(id = 'pl1') {
  return render(
    <MemoryRouter initialEntries={[`/playlist/${id}`]}>
      <Routes>
        <Route path="/playlist/:id" element={<PlaylistDetail />} />
        <Route path="/artist/:id" element={<div data-testid="artist-page" />} />
        <Route path="/album/:id" element={<div data-testid="album-page" />} />
      </Routes>
    </MemoryRouter>
  );
}

// ---- Tests ----

describe('PlaylistDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCurrentlyPlaying.mockReturnValue({ data: null });
  });

  describe('loading state', () => {
    it('renders skeleton rows while loading', () => {
      mockUsePlaylist.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() });
      mockUsePlaylistItems.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() });

      renderWithRouter();

      expect(screen.getByTestId('playlist-detail-loading')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('renders error message when playlist fetch fails', () => {
      mockUsePlaylist.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() });
      mockUsePlaylistItems.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() });

      renderWithRouter();

      expect(screen.getByText(/failed to load playlist/i)).toBeInTheDocument();
    });

    it('renders retry button in error state', () => {
      mockUsePlaylist.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() });
      mockUsePlaylistItems.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() });

      renderWithRouter();

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  describe('rendered content', () => {
    const trackItems = [
      makeTrackItem({ id: 'track1', name: 'Song One', artistId: 'a1', artistName: 'Artist One', albumId: 'alb1', albumName: 'Album One', durationMs: 185000 }),
      makeTrackItem({ id: 'track2', name: 'Song Two', artistId: 'a2', artistName: 'Artist Two', albumId: 'alb2', albumName: 'Album Two', durationMs: 240000 }),
    ];

    beforeEach(() => {
      mockUsePlaylist.mockReturnValue({ data: mockPlaylist, isLoading: false, isError: false, refetch: vi.fn() });
      mockUsePlaylistItems.mockReturnValue({ data: { items: trackItems }, isLoading: false, isError: false, refetch: vi.fn() });
    });

    it('renders the playlist name', () => {
      renderWithRouter();
      expect(screen.getByText('My Test Playlist')).toBeInTheDocument();
    });

    it('renders the "Playlist" label', () => {
      renderWithRouter();
      expect(screen.getByText('Playlist')).toBeInTheDocument();
    });

    it('renders cover art', () => {
      renderWithRouter();
      expect(screen.getByTestId('playlist-cover')).toHaveAttribute('src', 'http://img.test/cover.jpg');
    });

    it('renders owner name', () => {
      renderWithRouter();
      expect(screen.getByText(/Test User/)).toBeInTheDocument();
    });

    it('renders song count', () => {
      renderWithRouter();
      expect(screen.getByText(/2 songs/)).toBeInTheDocument();
    });

    it('renders track names', () => {
      renderWithRouter();
      expect(screen.getByText('Song One')).toBeInTheDocument();
      expect(screen.getByText('Song Two')).toBeInTheDocument();
    });

    it('renders track durations in m:ss format', () => {
      renderWithRouter();
      expect(screen.getByText('3:05')).toBeInTheDocument(); // 185000ms
      expect(screen.getByText('4:00')).toBeInTheDocument(); // 240000ms
    });

    it('renders column headers', () => {
      renderWithRouter();
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Album')).toBeInTheDocument();
      expect(screen.getByText('Duration')).toBeInTheDocument();
    });

    it('renders track index numbers', () => {
      renderWithRouter();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('calls play mutation with context_uri and offset on row click', () => {
      renderWithRouter();
      const row = screen.getByRole('row', { name: /Song One/i });
      fireEvent.click(row);
      expect(mockPlayMutate).toHaveBeenCalledWith({
        context_uri: 'spotify:playlist:pl1',
        offset: { position: 0 },
      });
    });

    it('calls play mutation with playlist uri when play button is clicked', () => {
      renderWithRouter();
      const playBtn = screen.getByRole('button', { name: /play playlist/i });
      fireEvent.click(playBtn);
      expect(mockPlayMutate).toHaveBeenCalledWith({ context_uri: 'spotify:playlist:pl1' });
    });

    it('highlights currently playing track in green', () => {
      mockUseCurrentlyPlaying.mockReturnValue({ data: { item: { id: 'track1' }, is_playing: true } });

      renderWithRouter();

      const songOne = screen.getByText('Song One');
      expect(songOne).toHaveClass('text-accent');
    });

    it('navigates to artist page when artist name is clicked', () => {
      renderWithRouter();
      const artistButton = screen.getByRole('button', { name: 'Artist One' });
      fireEvent.click(artistButton);
      expect(screen.getByTestId('artist-page')).toBeInTheDocument();
    });

    it('navigates to album page when album name is clicked', () => {
      renderWithRouter();
      const albumButtons = screen.getAllByRole('button', { name: 'Album One' });
      fireEvent.click(albumButtons[0]);
      expect(screen.getByTestId('album-page')).toBeInTheDocument();
    });

    it('renders empty state when no tracks', () => {
      mockUsePlaylistItems.mockReturnValue({ data: { items: [] }, isLoading: false, isError: false, refetch: vi.fn() });

      renderWithRouter();
      expect(screen.getByText(/This playlist is empty/i)).toBeInTheDocument();
    });
  });
});
