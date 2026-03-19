import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthToken } from './useAuthToken';

// Import types from our SDK declaration
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyPlayer;
    };
  }
}

// Generic event callback type for Spotify Player events
type SpotifyEventCallback<T = unknown> = (data: T) => void;

interface SpotifyPlayer {
  addListener: <T = unknown>(event: string, callback: SpotifyEventCallback<T>) => boolean;
  removeListener: <T = unknown>(event: string, callback?: SpotifyEventCallback<T>) => boolean;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  getCurrentState: () => Promise<SpotifyPlayerState | null>;
  getVolume: () => Promise<number>;
  nextTrack: () => Promise<void>;
  pause: () => Promise<void>;
  previousTrack: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (position_ms: number) => Promise<void>;
  setName: (name: string) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  togglePlay: () => Promise<void>;
}

interface SpotifyPlayerState {
  context: {
    uri: string;
    metadata: Record<string, unknown>;
  };
  disallows: {
    pausing: boolean;
    peeking_next: boolean;
    peeking_prev: boolean;
    resuming: boolean;
    seeking: boolean;
    skipping_next: boolean;
    skipping_prev: boolean;
  };
  paused: boolean;
  position: number;
  repeat_mode: number;
  shuffle: boolean;
  track_window: {
    current_track: SpotifyTrack;
    previous_tracks: SpotifyTrack[];
    next_tracks: SpotifyTrack[];
  };
}

interface SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  is_playable: boolean;
  duration_ms: number;
  album: {
    uri: string;
    name: string;
    images: Array<{ url: string }>;
  };
  artists: Array<{
    uri: string;
    name: string;
  }>;
}

interface SpotifyError {
  message: string;
}

export interface PlayerState {
  is_paused: boolean;
  is_active: boolean;
  position: number;
  duration: number;
  current_track: SpotifyTrack | null;
  device_id: string | null;
}

export const useSpotifyPlayer = () => {
  const { accessToken } = useAuthToken();
  const [player, setPlayer] = useState<SpotifyPlayer | null>(null);
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState>({
    is_paused: true,
    is_active: false,
    position: 0,
    duration: 0,
    current_track: null,
    device_id: null,
  });

  const initializePlayer = useCallback(() => {
    if (!accessToken || !window.Spotify || playerRef.current) return;

    const spotifyPlayer = new window.Spotify.Player({
      name: 'React Spotify Player',
      getOAuthToken: (cb: (token: string) => void) => {
        cb(accessToken);
      },
      volume: 0.5,
    });

    // Error handling (errors are silently ignored; add telemetry here if needed)
    spotifyPlayer.addListener('initialization_error', (_: SpotifyError) => {});
    spotifyPlayer.addListener('authentication_error', (_: SpotifyError) => {});
    spotifyPlayer.addListener('account_error', (_: SpotifyError) => {});
    spotifyPlayer.addListener('playback_error', (_: SpotifyError) => {});

    // Playback status updates
    spotifyPlayer.addListener('player_state_changed', (state: SpotifyPlayerState | null) => {
      if (!state) return;

      setPlayerState({
        is_paused: state.paused,
        is_active: !!state.track_window?.current_track,
        position: state.position,
        duration: state.track_window?.current_track?.duration_ms || 0,
        current_track: state.track_window?.current_track || null,
        device_id: null, // Will be set when ready
      });
    });

    // Ready
    spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
      setPlayerState(prev => ({ ...prev, device_id }));
      setIsReady(true);
    });

    // Not Ready
    spotifyPlayer.addListener('not_ready', (_: { device_id: string }) => {
      setIsReady(false);
    });

    // Connect to the player!
    spotifyPlayer.connect();

    setPlayer(spotifyPlayer);
    playerRef.current = spotifyPlayer;
  }, [accessToken]);

  useEffect(() => {
    if (window.Spotify) {
      initializePlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initializePlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  }, [initializePlayer]); // Remove 'player' from dependencies to prevent infinite loop

  // Player controls
  const togglePlay = useCallback(() => {
    if (player) {
      player.togglePlay();
    }
  }, [player]);

  const nextTrack = useCallback(() => {
    if (player) {
      player.nextTrack();
    }
  }, [player]);

  const previousTrack = useCallback(() => {
    if (player) {
      player.previousTrack();
    }
  }, [player]);

  const seek = useCallback((position: number) => {
    if (player) {
      player.seek(position);
    }
  }, [player]);

  const setVolume = useCallback((volume: number) => {
    if (player) {
      player.setVolume(volume);
    }
  }, [player]);

  return {
    player,
    is_ready: isReady,
    playerState,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
  };
};
