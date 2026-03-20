import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ArtistDetail from '../ArtistDetail';

// ---- Module mocks ----

const mockUseArtist = vi.fn();
const mockUseArtistTopTracks = vi.fn();
const mockUseArtistAlbums = vi.fn();
const mockUseCurrentlyPlaying = vi.fn();
const mockPlayMutate = vi.fn();

vi.mock('../../hooks/useSpotifyQueries', () => ({
  useArtist: (...args: unknown[]) => mockUseArtist(...args),
  useArtistTopTracks: (...args: unknown[]) => mockUseArtistTopTracks(...args),
  useArtistAlbums: (...args: unknown[]) => mockUseArtistAlbums(...args),
  useCurrentlyPlaying: () => mockUseCurrentlyPlaying(),
}));

vi.mock('../../hooks/useSpotifyMutations', () => ({
  usePlaybackControls: () => ({
    play: { mutate: mockPlayMutate },
  }),
}));

// ---- Test helpers ----

const mockArtist = {
  id: 'artist1',
  name: 'Test Artist',
  uri: 'spotify:artist:artist1',
  images: [{ url: 'http://img.test/artist.jpg', width: 640, height: 640 }],
  followers: { total: 1234567, href: null },
  genres: ['pop', 'indie'],
  popularity: 85,
  type: 'artist' as const,
  href: '',
  external_urls: { spotify: '' },
};

const makeTrack = (overrides: {
  id: string;
  name: string;
  uri?: string;
  durationMs?: number;
  popularity?: number;
}) => ({
  id: overrides.id,
  name: overrides.name,
  uri: overrides.uri ?? `spotify:track:${overrides.id}`,
  duration_ms: overrides.durationMs ?? 210000,
  explicit: false,
  disc_number: 1,
  track_number: 1,
  href: '',
  is_local: false,
  popularity: overrides.popularity ?? 70,
  type: 'track' as const,
  external_urls: { spotify: '' },
  artists: [{ id: 'artist1', name: 'Test Artist', type: 'artist' as const, href: '', uri: '', external_urls: { spotify: '' } }],
  album: {
    id: 'alb1',
    name: 'Test Album',
    images: [{ url: 'http://img.test/album.jpg' }],
    release_date: '2022-01-01',
    type: 'album' as const,
    album_type: 'album' as const,
    href: '',
    uri: 'spotify:album:alb1',
    external_urls: { spotify: '' },
    artists: [],
    total_tracks: 10,
    release_date_precision: 'day' as const,
  },
});

const makeAlbum = (overrides: { id: string; name: string; releaseDate?: string }) => ({
  id: overrides.id,
  name: overrides.name,
  uri: `spotify:album:${overrides.id}`,
  album_type: 'album' as const,
  total_tracks: 10,
  images: [{ url: `http://img.test/${overrides.id}.jpg` }],
  artists: [{ id: 'artist1', name: 'Test Artist', type: 'artist' as const, href: '', uri: '', external_urls: { spotify: '' } }],
  release_date: overrides.releaseDate ?? '2022-06-15',
  release_date_precision: 'day' as const,
  external_urls: { spotify: '' },
  href: '',
  type: 'album' as const,
});

const defaultTopTracks = [
  makeTrack({ id: 't1', name: 'Hit Song One', durationMs: 185000, popularity: 90 }),
  makeTrack({ id: 't2', name: 'Hit Song Two', durationMs: 240000, popularity: 80 }),
  makeTrack({ id: 't3', name: 'Hit Song Three', durationMs: 200000, popularity: 75 }),
];

const defaultAlbums = [
  makeAlbum({ id: 'alb1', name: 'First Album', releaseDate: '2020-03-01' }),
  makeAlbum({ id: 'alb2', name: 'Second Album', releaseDate: '2022-06-15' }),
];

function renderWithRouter(id = 'artist1') {
  return render(
    <MemoryRouter initialEntries={[`/artist/${id}`]}>
      <Routes>
        <Route path="/artist/:id" element={<ArtistDetail />} />
        <Route path="/album/:id" element={<div data-testid="album-page" />} />
      </Routes>
    </MemoryRouter>
  );
}

// ---- Tests ----

describe('ArtistDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCurrentlyPlaying.mockReturnValue({ data: null });
  });

  describe('loading state', () => {
    it('renders skeleton while loading', () => {
      mockUseArtist.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() });
      mockUseArtistTopTracks.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() });
      mockUseArtistAlbums.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() });

      renderWithRouter();

      expect(screen.getByTestId('artist-detail-loading')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('renders error message when artist fetch fails', () => {
      mockUseArtist.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() });
      mockUseArtistTopTracks.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() });
      mockUseArtistAlbums.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() });

      renderWithRouter();

      expect(screen.getByText(/failed to load artist/i)).toBeInTheDocument();
    });

    it('renders retry button in error state', () => {
      mockUseArtist.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() });
      mockUseArtistTopTracks.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() });
      mockUseArtistAlbums.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() });

      renderWithRouter();

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('calls all refetch functions when retry is clicked', () => {
      const refetchArtist = vi.fn();
      const refetchTracks = vi.fn();
      const refetchAlbums = vi.fn();
      mockUseArtist.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: refetchArtist });
      mockUseArtistTopTracks.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: refetchTracks });
      mockUseArtistAlbums.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: refetchAlbums });

      renderWithRouter();

      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      expect(refetchArtist).toHaveBeenCalled();
      expect(refetchTracks).toHaveBeenCalled();
      expect(refetchAlbums).toHaveBeenCalled();
    });
  });

  describe('hero section', () => {
    beforeEach(() => {
      mockUseArtist.mockReturnValue({ data: mockArtist, isLoading: false, isError: false, refetch: vi.fn() });
      mockUseArtistTopTracks.mockReturnValue({ data: { tracks: defaultTopTracks }, isLoading: false, isError: false, refetch: vi.fn() });
      mockUseArtistAlbums.mockReturnValue({ data: { items: defaultAlbums }, isLoading: false, isError: false, refetch: vi.fn() });
    });

    it('renders the artist name', () => {
      renderWithRouter();
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
    });

    it('renders the artist photo', () => {
      renderWithRouter();
      expect(screen.getByTestId('artist-photo')).toHaveAttribute('src', 'http://img.test/artist.jpg');
    });

    it('renders monthly listeners with formatted number', () => {
      renderWithRouter();
      expect(screen.getByText(/1,234,567 monthly listeners/i)).toBeInTheDocument();
    });

    it('renders play button', () => {
      renderWithRouter();
      expect(screen.getByRole('button', { name: /play artist/i })).toBeInTheDocument();
    });

    it('renders follow button', () => {
      renderWithRouter();
      expect(screen.getByRole('button', { name: /follow artist/i })).toBeInTheDocument();
    });

    it('renders placeholder when no artist image', () => {
      mockUseArtist.mockReturnValue({
        data: { ...mockArtist, images: [] },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByTestId('artist-photo-placeholder')).toBeInTheDocument();
    });
  });

  describe('Popular tracks section', () => {
    beforeEach(() => {
      mockUseArtist.mockReturnValue({ data: mockArtist, isLoading: false, isError: false, refetch: vi.fn() });
      mockUseArtistTopTracks.mockReturnValue({ data: { tracks: defaultTopTracks }, isLoading: false, isError: false, refetch: vi.fn() });
      mockUseArtistAlbums.mockReturnValue({ data: { items: defaultAlbums }, isLoading: false, isError: false, refetch: vi.fn() });
    });

    it('renders "Popular" section heading', () => {
      renderWithRouter();
      expect(screen.getByText('Popular')).toBeInTheDocument();
    });

    it('renders track names', () => {
      renderWithRouter();
      expect(screen.getByText('Hit Song One')).toBeInTheDocument();
      expect(screen.getByText('Hit Song Two')).toBeInTheDocument();
      expect(screen.getByText('Hit Song Three')).toBeInTheDocument();
    });

    it('renders track rank numbers', () => {
      renderWithRouter();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders track duration in m:ss format', () => {
      renderWithRouter();
      expect(screen.getByText('3:05')).toBeInTheDocument(); // 185000ms
      expect(screen.getByText('4:00')).toBeInTheDocument(); // 240000ms
    });

    it('shows at most 5 tracks even if more are returned', () => {
      const manyTracks = [1, 2, 3, 4, 5, 6, 7].map((n) =>
        makeTrack({ id: `t${n}`, name: `Track ${n}` })
      );
      mockUseArtistTopTracks.mockReturnValue({ data: { tracks: manyTracks }, isLoading: false, isError: false, refetch: vi.fn() });

      renderWithRouter();

      expect(screen.queryByText('Track 6')).not.toBeInTheDocument();
      expect(screen.queryByText('Track 7')).not.toBeInTheDocument();
    });

    it('calls play mutation with track uri on row click', () => {
      renderWithRouter();
      const row = screen.getByRole('row', { name: 'Hit Song One' });
      fireEvent.click(row);
      expect(mockPlayMutate).toHaveBeenCalledWith({ uris: ['spotify:track:t1'] });
    });

    it('highlights currently playing track in green', () => {
      mockUseCurrentlyPlaying.mockReturnValue({ data: { item: { id: 't1' }, is_playing: true } });

      renderWithRouter();

      const trackName = screen.getByText('Hit Song One');
      expect(trackName).toHaveClass('text-accent');
    });

    it('does not highlight non-playing tracks', () => {
      mockUseCurrentlyPlaying.mockReturnValue({ data: { item: { id: 't1' }, is_playing: true } });

      renderWithRouter();

      const trackName = screen.getByText('Hit Song Two');
      expect(trackName).not.toHaveClass('text-accent');
    });
  });

  describe('Albums section', () => {
    beforeEach(() => {
      mockUseArtist.mockReturnValue({ data: mockArtist, isLoading: false, isError: false, refetch: vi.fn() });
      mockUseArtistTopTracks.mockReturnValue({ data: { tracks: defaultTopTracks }, isLoading: false, isError: false, refetch: vi.fn() });
      mockUseArtistAlbums.mockReturnValue({ data: { items: defaultAlbums }, isLoading: false, isError: false, refetch: vi.fn() });
    });

    it('renders "Albums" section heading', () => {
      renderWithRouter();
      expect(screen.getByText('Albums')).toBeInTheDocument();
    });

    it('renders album names', () => {
      renderWithRouter();
      expect(screen.getByText('First Album')).toBeInTheDocument();
      expect(screen.getByText('Second Album')).toBeInTheDocument();
    });

    it('renders album release years', () => {
      renderWithRouter();
      expect(screen.getByText('2020')).toBeInTheDocument();
      expect(screen.getByText('2022')).toBeInTheDocument();
    });

    it('shows at most 10 albums', () => {
      const manyAlbums = Array.from({ length: 12 }, (_, i) =>
        makeAlbum({ id: `alb${i + 1}`, name: `Album ${i + 1}`, releaseDate: `202${i % 3}-01-01` })
      );
      mockUseArtistAlbums.mockReturnValue({ data: { items: manyAlbums }, isLoading: false, isError: false, refetch: vi.fn() });

      renderWithRouter();

      expect(screen.queryByText('Album 11')).not.toBeInTheDocument();
      expect(screen.queryByText('Album 12')).not.toBeInTheDocument();
    });

    it('navigates to album page when album card is clicked', () => {
      renderWithRouter();

      const albumCard = screen.getByTestId('album-card-alb1');
      fireEvent.click(albumCard);

      expect(screen.getByTestId('album-page')).toBeInTheDocument();
    });
  });

  describe('full page render', () => {
    it('renders the main artist detail container', () => {
      mockUseArtist.mockReturnValue({ data: mockArtist, isLoading: false, isError: false, refetch: vi.fn() });
      mockUseArtistTopTracks.mockReturnValue({ data: { tracks: defaultTopTracks }, isLoading: false, isError: false, refetch: vi.fn() });
      mockUseArtistAlbums.mockReturnValue({ data: { items: defaultAlbums }, isLoading: false, isError: false, refetch: vi.fn() });

      renderWithRouter();

      expect(screen.getByTestId('artist-detail')).toBeInTheDocument();
    });
  });
});
