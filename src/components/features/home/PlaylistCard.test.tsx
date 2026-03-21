import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { PlaylistCard } from './PlaylistCard';
import type { PlaylistCardProps } from './PlaylistCard';
import type { Playlist } from '../../../types/spotify';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const makePlaylist = (overrides?: Partial<Playlist>): Playlist => ({
  id: 'pl1',
  name: 'My Playlist',
  description: 'A test playlist',
  uri: 'spotify:playlist:pl1',
  images: [{ url: 'https://img/pl1.jpg' }],
  owner: {
    id: 'user1',
    display_name: 'User 1',
    type: 'user',
    href: '',
    uri: '',
    external_urls: { spotify: '' },
  },
  followers: { total: 0 },
  tracks: { href: '', total: 10 },
  collaborative: false,
  public: true,
  snapshot_id: 'snap1',
  type: 'playlist',
  href: '',
  external_urls: { spotify: '' },
  ...overrides,
});

function renderCard(props: Partial<PlaylistCardProps> = {}) {
  const defaults: PlaylistCardProps = {
    playlist: makePlaylist(),
    onPlay: vi.fn(),
    onPause: vi.fn(),
    isActive: false,
    isPlaying: false,
  };
  return render(
    <MemoryRouter>
      <PlaylistCard {...defaults} {...props} />
    </MemoryRouter>
  );
}

describe('PlaylistCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the playlist name', () => {
    renderCard();
    expect(screen.getByText('My Playlist')).toBeInTheDocument();
  });

  it('renders the description when present', () => {
    renderCard();
    expect(screen.getByText('A test playlist')).toBeInTheDocument();
  });

  it('renders the playlist image when present', () => {
    renderCard();
    const img = screen.getByAltText('My Playlist');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://img/pl1.jpg');
  });

  it('renders initials fallback when no image', () => {
    renderCard({ playlist: makePlaylist({ images: [] }) });
    expect(screen.getByText('MY')).toBeInTheDocument();
    expect(screen.queryByAltText('My Playlist')).not.toBeInTheDocument();
  });

  it('shows a Play button when not active', () => {
    renderCard({ isActive: false, isPlaying: false });
    expect(screen.getByRole('button', { name: /play My Playlist/i })).toBeInTheDocument();
  });

  it('shows a Pause button label when active and playing', () => {
    renderCard({ isActive: true, isPlaying: true });
    expect(screen.getByRole('button', { name: /pause My Playlist/i })).toBeInTheDocument();
  });

  it('calls onPlay with the playlist uri when clicked while not active', () => {
    const onPlay = vi.fn();
    renderCard({ onPlay, isActive: false, isPlaying: false });
    fireEvent.click(screen.getByRole('button', { name: /play My Playlist/i }));
    expect(onPlay).toHaveBeenCalledWith('spotify:playlist:pl1');
  });

  it('calls onPause when clicked while active and playing', () => {
    const onPause = vi.fn();
    renderCard({ onPause, isActive: true, isPlaying: true });
    fireEvent.click(screen.getByRole('button', { name: /pause My Playlist/i }));
    expect(onPause).toHaveBeenCalled();
  });

  it('navigates to /playlist/:id when the card is clicked', () => {
    renderCard();
    fireEvent.click(screen.getByTestId('playlist-card'));
    expect(mockNavigate).toHaveBeenCalledWith('/playlist/pl1');
  });
});
