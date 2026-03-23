import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { PlaylistTrackList } from './PlaylistTrackList';
import type { PlaylistItem } from '../../../types/spotify';

// Mock usePlaybackControls — TrackRow's onPlay fires play.mutate
const mockPlayMutate = vi.fn();
vi.mock('../../../hooks/useSpotifyMutations', () => ({
  usePlaybackControls: () => ({
    play: { mutate: mockPlayMutate },
  }),
}));

// Minimal Track shape required by TrackRow
const makeTrackItem = (id: string): PlaylistItem => ({
  added_at: '2024-01-01T00:00:00Z',
  added_by: { external_urls: { spotify: '' }, href: '', id: 'user1', type: 'user', uri: '' },
  is_local: false,
  item: {
    id,
    name: `Track ${id}`,
    uri: `spotify:track:${id}`,
    type: 'track',
    artists: [{ id: 'a1', name: 'Artist', type: 'artist', href: '', uri: '', external_urls: { spotify: '' } }],
    album: {
      id: 'al1', name: 'Album', images: [], album_type: 'album', total_tracks: 1,
      href: '', uri: '', external_urls: { spotify: '' }, release_date: '2024-01-01',
      release_date_precision: 'day', type: 'album', artists: [],
    },
    disc_number: 1, duration_ms: 180000, explicit: false,
    external_urls: { spotify: '' }, href: '', is_local: false,
    popularity: 50, track_number: 1,
  },
});

const makeEpisodeItem = (id: string): PlaylistItem => ({
  added_at: '2024-01-01T00:00:00Z',
  added_by: { external_urls: { spotify: '' }, href: '', id: 'user1', type: 'user', uri: '' },
  is_local: false,
  item: { id, name: `Episode ${id}`, type: 'episode', uri: `spotify:episode:${id}` },
});

function renderList(items: PlaylistItem[], playlistUri = 'spotify:playlist:pl1') {
  return render(
    <MemoryRouter>
      <PlaylistTrackList items={items} playlistUri={playlistUri} />
    </MemoryRouter>
  );
}

describe('PlaylistTrackList', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders a row for each track item', () => {
    renderList([makeTrackItem('1'), makeTrackItem('2')]);
    expect(screen.getByText('Track 1')).toBeInTheDocument();
    expect(screen.getByText('Track 2')).toBeInTheDocument();
  });

  it('filters out episode items', () => {
    renderList([makeTrackItem('1'), makeEpisodeItem('ep1')]);
    expect(screen.getByText('Track 1')).toBeInTheDocument();
    expect(screen.queryByText('Episode ep1')).not.toBeInTheDocument();
  });

  it('shows empty state when items array is empty', () => {
    renderList([]);
    expect(screen.getByText(/no tracks available/i)).toBeInTheDocument();
  });

  it('shows empty state when all items are episodes', () => {
    renderList([makeEpisodeItem('ep1'), makeEpisodeItem('ep2')]);
    expect(screen.getByText(/no tracks available/i)).toBeInTheDocument();
  });

  it('renders the Title column header', () => {
    renderList([makeTrackItem('1')]);
    expect(screen.getByText('Title')).toBeInTheDocument();
  });
});
