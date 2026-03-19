import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TrackRow } from './TrackRow';
import type { Track } from '../../types/spotify';

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

describe('TrackRow', () => {
  it('renders track name and artist', () => {
    render(<TrackRow track={mockTrack} onPlay={vi.fn()} />);
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  it('renders album art with small image preferred', () => {
    render(<TrackRow track={mockTrack} onPlay={vi.fn()} />);
    const img = screen.getByTestId('track-art-img');
    expect(img).toHaveAttribute('src', 'http://img.test/small.jpg');
  });

  it('renders placeholder when album is undefined', () => {
    const trackNoAlbum = { ...mockTrack, album: undefined };
    render(<TrackRow track={trackNoAlbum} onPlay={vi.fn()} />);
    expect(screen.queryByTestId('track-art-img')).toBeNull();
    expect(screen.getByTestId('track-art-placeholder')).toBeInTheDocument();
  });

  it('calls onPlay with track uri when row button is clicked', () => {
    const onPlay = vi.fn();
    render(<TrackRow track={mockTrack} onPlay={onPlay} />);
    fireEvent.click(screen.getByRole('button', { name: /test song/i }));
    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onPlay).toHaveBeenCalledWith('spotify:track:1');
  });

  it('renders a play icon overlay (decorative, no separate button)', () => {
    render(<TrackRow track={mockTrack} onPlay={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
