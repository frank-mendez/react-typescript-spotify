import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthToken } from "./useAuthToken";

interface SdkSpotifyPlayer {
  addListener: <T = unknown>(event: string, callback: (data: T) => void) => boolean;
  removeListener: <T = unknown>(
    event: string,
    callback?: (data: T) => void,
  ) => boolean;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  getCurrentState: () => Promise<SdkSpotifyPlayerState | null>;
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

interface SdkSpotifyPlayerState {
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
    current_track: SdkSpotifyTrack;
    previous_tracks: SdkSpotifyTrack[];
    next_tracks: SdkSpotifyTrack[];
  };
}

interface SdkSpotifyTrack {
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

export interface PlayerState {
  is_paused: boolean;
  is_active: boolean;
  position: number;
  duration: number;
  current_track: SdkSpotifyTrack | null;
  device_id: string | null;
}

export const useSpotifyPlayer = () => {
  const { accessToken } = useAuthToken();
  const [player, setPlayer] = useState<SdkSpotifyPlayer | null>(null);
  const playerRef = useRef<SdkSpotifyPlayer | null>(null);
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
      name: "React Spotify Player",
      getOAuthToken: (cb: (token: string) => void) => {
        cb(accessToken);
      },
      volume: 0.5,
    });

    const logPlayerError = (eventName: string) => (error: unknown) => {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Unknown Spotify player error";

      console.error(`Spotify player ${eventName}:`, message);
    };

    spotifyPlayer.addListener(
      "initialization_error",
      logPlayerError("initialization_error"),
    );
    spotifyPlayer.addListener(
      "authentication_error",
      logPlayerError("authentication_error"),
    );
    spotifyPlayer.addListener("account_error", logPlayerError("account_error"));
    spotifyPlayer.addListener(
      "playback_error",
      logPlayerError("playback_error"),
    );

    // Playback status updates
    spotifyPlayer.addListener(
      "player_state_changed",
      (state: SdkSpotifyPlayerState | null) => {
        if (!state) return;

        setPlayerState((prev) => ({
          ...prev,
          is_paused: state.paused,
          is_active: !!state.track_window?.current_track,
          position: state.position,
          duration: state.track_window?.current_track?.duration_ms || 0,
          current_track: state.track_window?.current_track || null,
        }));
      },
    );

    // Ready
    spotifyPlayer.addListener(
      "ready",
      ({ device_id }: { device_id: string }) => {
        setPlayerState((prev) => ({ ...prev, device_id }));
        setIsReady(true);
      },
    );

    // Not Ready
    spotifyPlayer.addListener("not_ready", () => {
      setIsReady(false);
      setPlayerState((prev) => ({ ...prev, device_id: null }));
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

      if (!document.getElementById("spotify-player-script")) {
        const script = document.createElement("script");
        script.id = "spotify-player-script";
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      window.onSpotifyWebPlaybackSDKReady = null as unknown as () => void;
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

  const seek = useCallback(
    (position: number) => {
      if (player) {
        player.seek(position);
      }
    },
    [player],
  );

  const setVolume = useCallback(
    (volume: number) => {
      if (player) {
        player.setVolume(volume);
      }
    },
    [player],
  );

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
