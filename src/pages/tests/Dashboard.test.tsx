import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Dashboard from '../Dashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock hooks that make API calls
vi.mock('../../hooks/useSpotifyQueries', () => ({
  useCurrentPlayback: () => ({ data: null, isLoading: false }),
  useCurrentlyPlaying: () => ({ data: null, isLoading: false }),
  useUserPlaylists: () => ({ data: null, isLoading: false }),
  useCurrentUserProfile: () => ({ data: null, isLoading: false }),
}));

vi.mock('../../hooks/useSpotifyMutations', () => ({
  usePlaybackControls: () => ({
    play: { mutate: vi.fn() },
    pause: { mutate: vi.fn() },
    next: { mutate: vi.fn() },
    previous: { mutate: vi.fn() },
    seek: { mutate: vi.fn() },
    setVolume: { mutate: vi.fn() },
    setRepeat: { mutate: vi.fn() },
    setShuffle: { mutate: vi.fn() },
  }),
}));

vi.mock('../../hooks/useSpotifyPlayer', () => ({
  useSpotifyPlayer: () => ({
    playerState: {
      device_id: null,
      is_paused: true,
      is_active: false,
      position: 0,
      duration: 0,
      current_track: null,
    },
    is_ready: false,
    togglePlay: vi.fn(),
    nextTrack: vi.fn(),
    previousTrack: vi.fn(),
    seek: vi.fn(),
    setVolume: vi.fn(),
  }),
}));

vi.mock('../../stores/usePlayerStore', () => ({
  usePlayerStore: () => ({
    deviceId: null,
    setDeviceId: vi.fn(),
  }),
}));

describe('Dashboard Component', () => {
  const mockAuthContext = {
    accessToken: 'mockAccessToken',
    isLoading: false,
    login: async () => {},
    logout: () => {},
    refreshToken: 'mockRefresh',
  };

  const renderDashboard = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={mockAuthContext}>
          <BrowserRouter>
            <Dashboard />
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

  it('renders without crashing', () => {
    renderDashboard();
    expect(screen.getByTestId('dashboard-element')).toBeInTheDocument();
  });

  it('contains a sidebar', () => {
    renderDashboard();
    expect(screen.getByTestId('sidebar-element')).toBeInTheDocument();
  });

  it('contains a player bar', () => {
    renderDashboard();
    expect(screen.getByTestId('player-bar-element')).toBeInTheDocument();
  });
});
