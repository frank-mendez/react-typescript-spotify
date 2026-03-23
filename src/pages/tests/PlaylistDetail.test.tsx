import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PlaylistDetail from '../PlaylistDetail';

// ---- Module mocks ----

const mockUsePlaylist = vi.fn();
const mockPlayMutate = vi.fn();

vi.mock('../../hooks/useSpotifyQueries', () => ({
  usePlaylist: (...args: unknown[]) => mockUsePlaylist(...args),
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
};

const mockTrackForPlaylist = {
  id: 'tr1',
  name: 'Test Track',
  uri: 'spotify:track:tr1',
  type: 'track' as const,
  artists: [{ id: 'a1', name: 'Test Artist', type: 'artist' as const, href: '', uri: '', external_urls: { spotify: '' } }],
  album: {
    id: 'al1', name: 'Test Album', images: [], album_type: 'album' as const, total_tracks: 1,
    href: '', uri: '', external_urls: { spotify: '' }, release_date: '2024-01-01',
    release_date_precision: 'day' as const, type: 'album' as const, artists: [],
  },
  disc_number: 1, duration_ms: 180000, explicit: false,
  external_urls: { spotify: '' }, href: '', is_local: false,
  popularity: 50, track_number: 1,
};

const mockPlaylistItem = {
  added_at: '2024-01-01T00:00:00Z',
  added_by: { external_urls: { spotify: '' }, href: '', id: 'user1', type: 'user' as const, uri: '' },
  is_local: false,
  item: mockTrackForPlaylist,
};

const mockPlaylistWithTracks = {
  ...mockPlaylist,
  items: {
    href: '',
    limit: 20,
    offset: 0,
    total: 1,
    items: [mockPlaylistItem],
  },
};

function renderWithRouter(id = 'pl1') {
  return render(
    <MemoryRouter initialEntries={[`/playlist/${id}`]}>
      <Routes>
        <Route path="/playlist/:id" element={<PlaylistDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

// ---- Tests ----

describe('PlaylistDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('renders skeleton while loading', () => {
      mockUsePlaylist.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() });

      renderWithRouter();

      expect(screen.getByTestId('playlist-detail-loading')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('renders error message when playlist fetch fails', () => {
      mockUsePlaylist.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() });

      renderWithRouter();

      expect(screen.getByText(/failed to load playlist/i)).toBeInTheDocument();
    });

    it('renders retry button in error state', () => {
      mockUsePlaylist.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() });

      renderWithRouter();

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  describe('rendered content', () => {
    beforeEach(() => {
      mockUsePlaylist.mockReturnValue({ data: mockPlaylist, isLoading: false, isError: false, refetch: vi.fn() });
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

    it('renders play button', () => {
      renderWithRouter();
      expect(screen.getByRole('button', { name: /play playlist/i })).toBeInTheDocument();
    });

    it('calls play mutation with playlist uri when play button is clicked', () => {
      renderWithRouter();
      fireEvent.click(screen.getByRole('button', { name: /play playlist/i }));
      expect(mockPlayMutate).toHaveBeenCalledWith({ context_uri: 'spotify:playlist:pl1' });
    });

    it('renders playlist detail container', () => {
      renderWithRouter();
      expect(screen.getByTestId('playlist-detail')).toBeInTheDocument();
    });

    it('renders track list when playlist has items', () => {
      mockUsePlaylist.mockReturnValue({
        data: mockPlaylistWithTracks,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });
      renderWithRouter();
      expect(screen.getByText('Test Track')).toBeInTheDocument();
    });

    it('renders empty state when playlist has no items', () => {
      mockUsePlaylist.mockReturnValue({
        data: { ...mockPlaylist, items: { href: '', limit: 20, offset: 0, total: 0, items: [] } },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });
      renderWithRouter();
      expect(screen.getByText(/no tracks available/i)).toBeInTheDocument();
    });
  });
});
