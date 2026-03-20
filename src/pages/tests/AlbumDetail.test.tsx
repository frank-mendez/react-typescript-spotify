import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AlbumDetail from '../AlbumDetail';

// ---- Module mocks ----

const mockUseAlbum = vi.fn();
const mockUseAlbumTracks = vi.fn();
const mockUseCurrentlyPlaying = vi.fn();
const mockPlayMutate = vi.fn();

vi.mock('../../hooks/useSpotifyQueries', () => ({
  useAlbum: (...args: unknown[]) => mockUseAlbum(...args),
  useAlbumTracks: (...args: unknown[]) => mockUseAlbumTracks(...args),
  useCurrentlyPlaying: () => mockUseCurrentlyPlaying(),
}));

vi.mock('../../hooks/useSpotifyMutations', () => ({
  usePlaybackControls: () => ({
    play: { mutate: mockPlayMutate },
  }),
}));

// ---- Test helpers ----

const mockAlbum = {
  id: 'alb1',
  name: 'My Test Album',
  uri: 'spotify:album:alb1',
  album_type: 'album' as const,
  total_tracks: 2,
  images: [{ url: 'http://img.test/cover.jpg' }],
  artists: [
    {
      id: 'artist1',
      name: 'Test Artist',
      type: 'artist' as const,
      href: '',
      uri: '',
      external_urls: { spotify: '' },
    },
  ],
  release_date: '2022-06-15',
  release_date_precision: 'day' as const,
  external_urls: { spotify: '' },
  href: '',
  type: 'album' as const,
  tracks: { total: 2, href: '', limit: 50, next: null, offset: 0, previous: null, items: [] },
};

const makeTrack = (overrides: {
  id: string;
  name: string;
  artistId?: string;
  artistName?: string;
  durationMs?: number;
  trackNumber?: number;
}) => ({
  id: overrides.id,
  name: overrides.name,
  uri: `spotify:track:${overrides.id}`,
  duration_ms: overrides.durationMs ?? 210000,
  explicit: false,
  disc_number: 1,
  track_number: overrides.trackNumber ?? 1,
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
});

function renderWithRouter(id = 'alb1') {
  return render(
    <MemoryRouter initialEntries={[`/album/${id}`]}>
      <Routes>
        <Route path="/album/:id" element={<AlbumDetail />} />
        <Route path="/artist/:id" element={<div data-testid="artist-page" />} />
      </Routes>
    </MemoryRouter>
  );
}

// ---- Tests ----

describe('AlbumDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCurrentlyPlaying.mockReturnValue({ data: null });
  });

  describe('loading state', () => {
    it('renders skeleton while loading', () => {
      mockUseAlbum.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() });
      mockUseAlbumTracks.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() });

      renderWithRouter();

      expect(screen.getByTestId('album-detail-loading')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('renders error message when album fetch fails', () => {
      mockUseAlbum.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() });
      mockUseAlbumTracks.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() });

      renderWithRouter();

      expect(screen.getByText(/failed to load album/i)).toBeInTheDocument();
    });

    it('renders retry button in error state', () => {
      mockUseAlbum.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() });
      mockUseAlbumTracks.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() });

      renderWithRouter();

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('calls refetch functions when retry is clicked', () => {
      const refetchAlbum = vi.fn();
      const refetchTracks = vi.fn();
      mockUseAlbum.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: refetchAlbum });
      mockUseAlbumTracks.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: refetchTracks });

      renderWithRouter();

      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      expect(refetchAlbum).toHaveBeenCalled();
      expect(refetchTracks).toHaveBeenCalled();
    });
  });

  describe('rendered content', () => {
    const tracks = [
      makeTrack({ id: 'track1', name: 'Song One', artistId: 'a1', artistName: 'Artist One', durationMs: 185000, trackNumber: 1 }),
      makeTrack({ id: 'track2', name: 'Song Two', artistId: 'a2', artistName: 'Artist Two', durationMs: 240000, trackNumber: 2 }),
    ];

    beforeEach(() => {
      mockUseAlbum.mockReturnValue({ data: mockAlbum, isLoading: false, isError: false, refetch: vi.fn() });
      mockUseAlbumTracks.mockReturnValue({ data: { items: tracks }, isLoading: false, isError: false, refetch: vi.fn() });
    });

    it('renders the album name', () => {
      renderWithRouter();
      expect(screen.getByText('My Test Album')).toBeInTheDocument();
    });

    it('renders the "Album" label', () => {
      renderWithRouter();
      expect(screen.getByText('Album')).toBeInTheDocument();
    });

    it('renders cover art', () => {
      renderWithRouter();
      expect(screen.getByTestId('album-cover')).toHaveAttribute('src', 'http://img.test/cover.jpg');
    });

    it('renders artist name in header', () => {
      renderWithRouter();
      expect(screen.getByTestId('album-artist-link')).toHaveTextContent('Test Artist');
    });

    it('renders release year', () => {
      renderWithRouter();
      expect(screen.getByText('2022')).toBeInTheDocument();
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

    it('renders column headers without Album column', () => {
      const { container } = renderWithRouter();
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Duration')).toBeInTheDocument();
      // The track list column headers should NOT include an "Album" column
      // (Note: "Album" appears in the header label, but not as a track list column)
      const columnHeaders = container.querySelector('.sticky.top-0');
      expect(columnHeaders).not.toHaveTextContent('Album');
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
        context_uri: 'spotify:album:alb1',
        offset: { position: 0 },
      });
    });

    it('calls play mutation with album uri when play button is clicked', () => {
      renderWithRouter();
      const playBtn = screen.getByRole('button', { name: /play album/i });
      fireEvent.click(playBtn);
      expect(mockPlayMutate).toHaveBeenCalledWith({ context_uri: 'spotify:album:alb1' });
    });

    it('highlights currently playing track in green', () => {
      mockUseCurrentlyPlaying.mockReturnValue({ data: { item: { id: 'track1' }, is_playing: true } });

      renderWithRouter();

      const songOne = screen.getByText('Song One');
      expect(songOne).toHaveClass('text-accent');
    });

    it('navigates to artist page when artist name in header is clicked', () => {
      renderWithRouter();
      const artistLink = screen.getByTestId('album-artist-link');
      fireEvent.click(artistLink);
      expect(screen.getByTestId('artist-page')).toBeInTheDocument();
    });

    it('navigates to artist page when artist name in track row is clicked', () => {
      renderWithRouter();
      const artistButtons = screen.getAllByRole('button', { name: 'Artist One' });
      // The second one is in the track row (first is the header artist link rendered as button)
      fireEvent.click(artistButtons[0]);
      expect(screen.getByTestId('artist-page')).toBeInTheDocument();
    });

    it('renders empty state when no tracks', () => {
      mockUseAlbumTracks.mockReturnValue({ data: { items: [] }, isLoading: false, isError: false, refetch: vi.fn() });

      renderWithRouter();
      expect(screen.getByText(/This album has no tracks/i)).toBeInTheDocument();
    });

    it('renders play and like buttons', () => {
      renderWithRouter();
      expect(screen.getByRole('button', { name: /play album/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /like album/i })).toBeInTheDocument();
    });
  });

  describe('cover image fallback', () => {
    it('renders placeholder when no cover image', () => {
      const albumWithoutImage = { ...mockAlbum, images: [] };
      mockUseAlbum.mockReturnValue({ data: albumWithoutImage, isLoading: false, isError: false, refetch: vi.fn() });
      mockUseAlbumTracks.mockReturnValue({ data: { items: [] }, isLoading: false, isError: false, refetch: vi.fn() });

      renderWithRouter();

      expect(screen.getByTestId('album-cover-placeholder')).toBeInTheDocument();
    });
  });
});
