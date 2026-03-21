import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { MadeForYouSection } from './MadeForYouSection';

vi.mock('../../../hooks/useSpotifyQueries', () => ({
  useMadeForYouPlaylists: vi.fn(),
  useCurrentPlayback: vi.fn(() => ({ data: null })),
}));

vi.mock('../../../hooks/useSpotifyMutations', () => ({
  usePlaybackControls: vi.fn(() => ({
    play: { mutate: vi.fn() },
    pause: { mutate: vi.fn() },
  })),
}));

vi.mock('../../../stores/usePlayerStore', () => ({
  usePlayerStore: vi.fn(() => ({ deviceId: 'test-device' })),
}));

import { useMadeForYouPlaylists } from '../../../hooks/useSpotifyQueries';

const makePlaylist = (id: string) => ({
  id,
  name: `Playlist ${id}`,
  description: '',
  uri: `spotify:playlist:${id}`,
  images: [{ url: `https://img/${id}.jpg` }],
  owner: { id: 'spotify', display_name: 'Spotify', type: 'user' as const, href: '', uri: '', external_urls: { spotify: '' } },
  followers: { total: 0 },
  tracks: { href: '', total: 5 },
  collaborative: false,
  public: true,
  snapshot_id: 'snap',
  type: 'playlist' as const,
  href: '',
  external_urls: { spotify: '' },
});

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc },
    createElement(MemoryRouter, null, children)
  );
}

describe('MadeForYouSection', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders skeleton while loading', () => {
    vi.mocked(useMadeForYouPlaylists).mockReturnValue({ isLoading: true, isError: false, data: undefined } as never);
    const { container } = render(<MadeForYouSection />, { wrapper });
    expect(screen.getByText('Made For You')).toBeInTheDocument();
    expect(screen.queryByAltText(/Playlist/)).not.toBeInTheDocument();
    expect(container.firstChild).toBeTruthy();
  });

  it('returns null when data has no playlists', () => {
    vi.mocked(useMadeForYouPlaylists).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { playlists: { items: [], total: 0 } },
    } as never);
    const { container } = render(<MadeForYouSection />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('returns null when isError is true', () => {
    vi.mocked(useMadeForYouPlaylists).mockReturnValue({ isLoading: false, isError: true, data: undefined } as never);
    const { container } = render(<MadeForYouSection />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('renders heading and playlist cards when data is present', () => {
    vi.mocked(useMadeForYouPlaylists).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        playlists: {
          items: [makePlaylist('p1'), makePlaylist('p2')],
          total: 2,
        },
      },
    } as never);
    render(<MadeForYouSection />, { wrapper });
    expect(screen.getByRole('heading', { name: 'Made For You' })).toBeInTheDocument();
    expect(screen.getByText('Playlist p1')).toBeInTheDocument();
    expect(screen.getByText('Playlist p2')).toBeInTheDocument();
  });

  it('shows right scroll arrow when content overflows', () => {
    vi.mocked(useMadeForYouPlaylists).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { playlists: { items: [makePlaylist('p1'), makePlaylist('p2')], total: 2 } },
    } as never);
    render(<MadeForYouSection />, { wrapper });
    const scrollContainer = screen.getByTestId('scroll-container') as HTMLElement;
    Object.defineProperty(scrollContainer, 'scrollLeft', { value: 0, writable: true, configurable: true });
    Object.defineProperty(scrollContainer, 'clientWidth', { value: 300, writable: true, configurable: true });
    Object.defineProperty(scrollContainer, 'scrollWidth', { value: 700, writable: true, configurable: true });
    fireEvent.scroll(scrollContainer);
    expect(screen.getByRole('button', { name: 'Scroll right' })).toBeInTheDocument();
  });

  it('shows the left scroll arrow when scrolled right', () => {
    vi.mocked(useMadeForYouPlaylists).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { playlists: { items: [makePlaylist('p1'), makePlaylist('p2')], total: 2 } },
    } as never);
    render(<MadeForYouSection />, { wrapper });
    const scrollContainer = screen.getByTestId('scroll-container') as HTMLElement;
    Object.defineProperty(scrollContainer, 'scrollLeft', { value: 200, writable: true, configurable: true });
    Object.defineProperty(scrollContainer, 'clientWidth', { value: 300, writable: true, configurable: true });
    Object.defineProperty(scrollContainer, 'scrollWidth', { value: 700, writable: true, configurable: true });
    fireEvent.scroll(scrollContainer);
    expect(screen.getByRole('button', { name: 'Scroll left' })).toBeInTheDocument();
  });
});
