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
  });
});
