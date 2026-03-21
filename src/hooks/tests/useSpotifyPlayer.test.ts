import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpotifyPlayer } from '../useSpotifyPlayer';

// Mock useAuthToken
const mockUseAuthToken = vi.fn();
vi.mock('../useAuthToken', () => ({
  useAuthToken: () => mockUseAuthToken()
}));

// Mock Spotify Web Playback SDK
const mockPlayer = {
  addListener: vi.fn(),
  removeListener: vi.fn(),
  connect: vi.fn().mockResolvedValue(true),
  disconnect: vi.fn(),
  getCurrentState: vi.fn(),
  getVolume: vi.fn(),
  nextTrack: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn().mockResolvedValue(undefined),
  previousTrack: vi.fn().mockResolvedValue(undefined),
  resume: vi.fn().mockResolvedValue(undefined),
  seek: vi.fn().mockResolvedValue(undefined),
  setName: vi.fn().mockResolvedValue(undefined),
  setVolume: vi.fn().mockResolvedValue(undefined),
  togglePlay: vi.fn().mockResolvedValue(undefined),
};

const mockSpotifyConstructor = vi.fn(() => mockPlayer);

// Mock global Spotify
Object.defineProperty(globalThis, 'Spotify', {
  writable: true,
  value: {
    Player: mockSpotifyConstructor,
  },
});

// Helper: extract a named listener from the mock
function getListener(eventName: string) {
  const call = mockPlayer.addListener.mock.calls.find(([e]) => e === eventName);
  return call?.[1] as ((data: unknown) => void) | undefined;
}

describe('useSpotifyPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthToken.mockReturnValue({
      accessToken: 'test-token',
      hasValidToken: true,
      refreshToken: vi.fn(),
      forceRefresh: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSpotifyPlayer());

    expect(result.current.is_ready).toBe(false);
    expect(result.current.playerState.is_paused).toBe(true);
    expect(result.current.playerState.current_track).toBeNull();
    expect(result.current.playerState.position).toBe(0);
    expect(result.current.playerState.duration).toBe(0);
    expect(result.current.playerState.device_id).toBeNull();
  });

  it('should provide control functions', () => {
    const { result } = renderHook(() => useSpotifyPlayer());

    expect(typeof result.current.togglePlay).toBe('function');
    expect(typeof result.current.nextTrack).toBe('function');
    expect(typeof result.current.previousTrack).toBe('function');
    expect(typeof result.current.seek).toBe('function');
    expect(typeof result.current.setVolume).toBe('function');
  });

  it('should handle missing access token', () => {
    mockUseAuthToken.mockReturnValue({
      accessToken: null,
      hasValidToken: false,
      refreshToken: vi.fn(),
      forceRefresh: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    });

    const { result } = renderHook(() => useSpotifyPlayer());

    expect(result.current.is_ready).toBe(false);
    expect(result.current.player).toBeNull();
  });

  const mockTrackState = {
    paused: false,
    position: 100,
    track_window: {
      current_track: {
        id: '1', uri: 'spotify:track:1', name: 'Song', is_playable: true, duration_ms: 3000,
        album: { uri: 'a', name: 'Album', images: [] },
        artists: [{ uri: 'b', name: 'Artist' }],
      },
      previous_tracks: [],
      next_tracks: [],
    },
  };

  it('player_state_changed preserves device_id set by ready event', async () => {
    const { result } = renderHook(() => useSpotifyPlayer());

    await act(async () => {
      getListener('ready')?.({ device_id: 'test-device-123' });
    });
    expect(result.current.playerState.device_id).toBe('test-device-123');

    await act(async () => {
      getListener('player_state_changed')?.(mockTrackState);
    });

    expect(result.current.playerState.device_id).toBe('test-device-123');
    expect(result.current.playerState.is_paused).toBe(false);
  });

  it('not_ready clears device_id', async () => {
    const { result } = renderHook(() => useSpotifyPlayer());

    await act(async () => {
      getListener('ready')?.({ device_id: 'test-device-123' });
    });
    expect(result.current.playerState.device_id).toBe('test-device-123');

    await act(async () => {
      getListener('not_ready')?.({ device_id: 'test-device-123' });
    });

    expect(result.current.playerState.device_id).toBeNull();
    expect(result.current.is_ready).toBe(false);
  });

  it('injects SDK script tag when (globalThis as typeof window).Spotify is not loaded', () => {
    const savedSpotify = (globalThis as typeof window).Spotify;
    (globalThis as typeof window).Spotify = undefined as unknown as typeof window.Spotify;

    const appendSpy = vi.spyOn(document.body, 'appendChild');

    renderHook(() => useSpotifyPlayer());

    expect(appendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'spotify-player-script',
        src: 'https://sdk.scdn.co/spotify-player.js',
        async: true,
      }),
    );

    // cleanup
    appendSpy.mockRestore();
    document.getElementById('spotify-player-script')?.remove();
    (globalThis as typeof window).Spotify = savedSpotify;
  });

  it('clears onSpotifyWebPlaybackSDKReady and disconnects player on unmount', () => {
    const { unmount } = renderHook(() => useSpotifyPlayer());

    unmount();

    expect((globalThis as typeof window).onSpotifyWebPlaybackSDKReady).toBeNull();
    expect(mockPlayer.disconnect).toHaveBeenCalled();
  });

  it('does not inject SDK script if already present in DOM', () => {
    const savedSpotify = (globalThis as typeof window).Spotify;
    (globalThis as typeof window).Spotify = undefined as unknown as typeof window.Spotify;

    const existing = document.createElement('script');
    existing.id = 'spotify-player-script';
    document.body.appendChild(existing);

    const appendSpy = vi.spyOn(document.body, 'appendChild');

    renderHook(() => useSpotifyPlayer());

    expect(appendSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ id: 'spotify-player-script' }),
    );

    // cleanup
    appendSpy.mockRestore();
    existing.remove();
    (globalThis as typeof window).Spotify = savedSpotify;
  });
});
