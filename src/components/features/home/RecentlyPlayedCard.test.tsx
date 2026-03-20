import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { RecentlyPlayedCard } from './RecentlyPlayedCard';
import type { RecentItem } from './RecentlyPlayedCard';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const albumItem: RecentItem = {
  id: 'album1',
  name: 'Test Album',
  imageUrl: 'https://img.test/cover.jpg',
  type: 'album',
  uri: 'spotify:album:album1',
  navigationPath: '/album/album1',
  subtitle: 'Test Artist',
};

const artistItem: RecentItem = {
  id: 'artist1',
  name: 'Test Artist',
  imageUrl: undefined,
  type: 'artist',
  uri: 'spotify:artist:artist1',
  navigationPath: '/artist/artist1',
  subtitle: 'Artist',
};

function renderCard(item = albumItem, onPlay = vi.fn()) {
  return render(
    <MemoryRouter>
      <RecentlyPlayedCard item={item} onPlay={onPlay} />
    </MemoryRouter>
  );
}

describe('RecentlyPlayedCard', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders item name and subtitle', () => {
    renderCard();
    expect(screen.getByText('Test Album')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  it('renders album image when imageUrl is provided', () => {
    renderCard();
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://img.test/cover.jpg');
  });

  it('renders initials fallback when imageUrl is undefined', () => {
    renderCard(artistItem);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('TE')).toBeInTheDocument(); // "Test Artist" → "TE"
  });

  it('calls onPlay with item uri when play button is clicked', () => {
    const onPlay = vi.fn();
    renderCard(albumItem, onPlay);
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    expect(onPlay).toHaveBeenCalledWith('spotify:album:album1');
  });

  it('does not navigate when play button is clicked', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to navigationPath when card body is clicked', () => {
    renderCard();
    fireEvent.click(screen.getByTestId('card-body'));
    expect(mockNavigate).toHaveBeenCalledWith('/album/album1');
  });
});
