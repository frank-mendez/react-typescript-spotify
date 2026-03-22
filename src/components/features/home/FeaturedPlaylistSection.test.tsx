import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FeaturedPlaylistSection } from './FeaturedPlaylistSection';
import { wrapper, makePlaylist } from './test-utils';

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

describe('FeaturedPlaylistSection', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders skeleton cards while loading', () => {
    vi.mocked(useFeaturedPlaylists).mockReturnValue({ isLoading: true, isError: false, data: undefined } as never);
    const { container } = render(<FeaturedPlaylistSection />, { wrapper });
    expect(screen.getByText('Featured Playlists')).toBeInTheDocument();
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
    const scrollContainer = screen.getByTestId('scroll-container') as HTMLElement;
    if (scrollContainer) {
      Object.defineProperty(scrollContainer, 'scrollLeft', { value: 0, writable: true, configurable: true });
      Object.defineProperty(scrollContainer, 'clientWidth', { value: 300, writable: true, configurable: true });
      Object.defineProperty(scrollContainer, 'scrollWidth', { value: 700, writable: true, configurable: true });
      fireEvent.scroll(scrollContainer);
    }
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
