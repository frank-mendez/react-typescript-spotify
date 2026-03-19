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

interface SpotifyPlayer {
  addListener: <T = unknown>(
    event: string,
    callback: (data: T) => void,
  ) => boolean;
  removeListener: <T = unknown>(
    event: string,
    callback?: (data: T) => void,
  ) => boolean;
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

export {};
