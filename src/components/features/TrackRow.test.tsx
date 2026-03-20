import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { TrackRow } from './TrackRow';
import type { Track } from '../../types/spotify';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockTrack: Track = {
  id: '1',
  name: 'Test Song',
  uri: 'spotify:track:1',
  artists: [{ id: 'a1', name: 'Test Artist', type: 'artist', href: '', uri: '', external_urls: { spotify: '' } }],
  album: {
    id: 'al1',
    name: 'Test Album',
    images: [
      { url: 'http://img.test/large.jpg' },
      { url: 'http://img.test/medium.jpg' },
      { url: 'http://img.test/small.jpg' },
    ],
    album_type: 'album',
    total_tracks: 10,
    href: '',
    uri: '',
    external_urls: { spotify: '' },
    release_date: '2024-01-01',
    release_date_precision: 'day',
    type: 'album',
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
  type: 'track',
};

function renderRow(track = mockTrack, onPlay = vi.fn()) {
  return render(
    <MemoryRouter>
      <TrackRow track={track} onPlay={onPlay} />
    </MemoryRouter>
  );
}

describe('TrackRow', () => {
  it('renders track name and artist', () => {
    renderRow();
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  it('renders album art with small image preferred', () => {
    renderRow();
    const img = screen.getByTestId('track-art-img');
    expect(img).toHaveAttribute('src', 'http://img.test/small.jpg');
  });

  it('renders placeholder when album is undefined', () => {
    const trackNoAlbum = { ...mockTrack, album: undefined };
    renderRow(trackNoAlbum);
    expect(screen.queryByTestId('track-art-img')).toBeNull();
    expect(screen.getByTestId('track-art-placeholder')).toBeInTheDocument();
  });

  it('calls onPlay with track uri when row button is clicked', () => {
    const onPlay = vi.fn();
    renderRow(mockTrack, onPlay);
    fireEvent.click(screen.getByRole('button', { name: /play test song/i }));
    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onPlay).toHaveBeenCalledWith('spotify:track:1');
  });

  it('renders clickable artist and album buttons in addition to the play row button', () => {
    renderRow();
    // outer play button + 1 artist button + 1 album button = 3
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('navigates to artist page when artist name is clicked', () => {
    renderRow();
    fireEvent.click(screen.getByText('Test Artist'));
    expect(mockNavigate).toHaveBeenCalledWith('/artist/a1');
  });

  it('navigates to album page when album name is clicked', () => {
    renderRow();
    fireEvent.click(screen.getByText('Test Album'));
    expect(mockNavigate).toHaveBeenCalledWith('/album/al1');
  });

  it('does not call onPlay when artist name is clicked (stopPropagation)', () => {
    const onPlay = vi.fn();
    renderRow(mockTrack, onPlay);
    fireEvent.click(screen.getByText('Test Artist'));
    expect(onPlay).not.toHaveBeenCalled();
  });
});
