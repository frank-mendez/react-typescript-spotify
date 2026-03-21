import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { FeaturedPlaylistSection } from './FeaturedPlaylistSection';

vi.mock('../../../hooks/useSpotifyQueries', () => ({
  useFeaturedPlaylists: vi.fn(),
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

import { useFeaturedPlaylists } from '../../../hooks/useSpotifyQueries';

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

describe('FeaturedPlaylistSection', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders skeleton cards while loading', () => {
    vi.mocked(useFeaturedPlaylists).mockReturnValue({ isLoading: true, isError: false, data: undefined } as never);
    const { container } = render(<FeaturedPlaylistSection />, { wrapper });
    // Section title is still shown during loading
    expect(screen.getByText('Featured Playlists')).toBeInTheDocument();
    // Skeleton elements are present (not real playlist cards)
    expect(screen.queryByAltText(/Playlist/)).not.toBeInTheDocument();
    expect(container.firstChild).toBeTruthy();
  });

  it('returns null when data is empty', () => {
    vi.mocked(useFeaturedPlaylists).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { playlists: { items: [], href: '', limit: 20, offset: 0, total: 0 } },
    } as never);
    const { container } = render(<FeaturedPlaylistSection />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('returns null when isError is true', () => {
    vi.mocked(useFeaturedPlaylists).mockReturnValue({ isLoading: false, isError: true, data: undefined } as never);
    const { container } = render(<FeaturedPlaylistSection />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('renders section heading and playlist cards when data is present', () => {
    vi.mocked(useFeaturedPlaylists).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        message: 'Featured playlists for you',
        playlists: {
          items: [makePlaylist('p1'), makePlaylist('p2')],
          href: '', limit: 20, offset: 0, total: 2,
        },
      },
    } as never);
    render(<FeaturedPlaylistSection />, { wrapper });
    expect(screen.getByRole('heading', { name: 'Featured Playlists' })).toBeInTheDocument();
    expect(screen.getByText('Playlist p1')).toBeInTheDocument();
    expect(screen.getByText('Playlist p2')).toBeInTheDocument();
  });

  it('uses the static title "Featured Playlists" (not the API message field)', () => {
    vi.mocked(useFeaturedPlaylists).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        message: 'Some dynamic API message',
        playlists: {
          items: [makePlaylist('p1')],
          href: '', limit: 20, offset: 0, total: 1,
        },
      },
    } as never);
    render(<FeaturedPlaylistSection />, { wrapper });
    expect(screen.getByRole('heading', { name: 'Featured Playlists' })).toBeInTheDocument();
    expect(screen.queryByText('Some dynamic API message')).not.toBeInTheDocument();
  });

  it('shows the right scroll arrow when content overflows', () => {
    vi.mocked(useFeaturedPlaylists).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        playlists: {
          items: [makePlaylist('p1'), makePlaylist('p2')],
          href: '', limit: 20, offset: 0, total: 2,
        },
      },
    } as never);
    render(<FeaturedPlaylistSection />, { wrapper });
    // Simulate overflow by overriding scroll container dimensions
    const scrollContainer = screen.getByTestId('scroll-container') as HTMLElement;
    if (scrollContainer) {
      Object.defineProperty(scrollContainer, 'scrollLeft', { value: 0, writable: true, configurable: true });
      Object.defineProperty(scrollContainer, 'clientWidth', { value: 300, writable: true, configurable: true });
      Object.defineProperty(scrollContainer, 'scrollWidth', { value: 700, writable: true, configurable: true });
      fireEvent.scroll(scrollContainer);
    }
    // Right arrow should be visible when scrollLeft(0) + clientWidth(300) < scrollWidth(700)
    expect(screen.getByRole('button', { name: 'Scroll right' })).toBeInTheDocument();
  });

  it('shows the left scroll arrow when scrolled right', () => {
    vi.mocked(useFeaturedPlaylists).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        playlists: {
          items: [makePlaylist('p1'), makePlaylist('p2')],
          href: '', limit: 20, offset: 0, total: 2,
        },
      },
    } as never);
    render(<FeaturedPlaylistSection />, { wrapper });
    const scrollContainer = screen.getByTestId('scroll-container') as HTMLElement;
    if (scrollContainer) {
      Object.defineProperty(scrollContainer, 'scrollLeft', { value: 200, writable: true, configurable: true });
      Object.defineProperty(scrollContainer, 'clientWidth', { value: 300, writable: true, configurable: true });
      Object.defineProperty(scrollContainer, 'scrollWidth', { value: 700, writable: true, configurable: true });
      fireEvent.scroll(scrollContainer);
    }
    expect(screen.getByRole('button', { name: 'Scroll left' })).toBeInTheDocument();
  });
});
