import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthToken } from "./useAuthToken";
import type {
  SpotifyPlayer,
  SpotifyPlayerState,
  SpotifyTrack,
} from "../types/spotify-sdk";

const spotifyWindow = globalThis as typeof globalThis & Window;

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
    if (!accessToken || !spotifyWindow.Spotify || playerRef.current) return;

    const spotifyPlayer = new spotifyWindow.Spotify.Player({
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

    const runPlayerCommand = (commandName: string, command: Promise<void>) => {
      void command.catch((error: unknown) => {
        logPlayerError(commandName)(error);
      });
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
      (state: SpotifyPlayerState | null) => {
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
    runPlayerCommand(
      "connect",
      spotifyPlayer.connect().then(() => undefined),
    );

    setPlayer(spotifyPlayer);
    playerRef.current = spotifyPlayer;
  }, [accessToken]);

  useEffect(() => {
    if (spotifyWindow.Spotify) {
      initializePlayer();
    } else {
      spotifyWindow.onSpotifyWebPlaybackSDKReady = initializePlayer;

      if (!document.getElementById("spotify-player-script")) {
        const script = document.createElement("script");
        script.id = "spotify-player-script";
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      spotifyWindow.onSpotifyWebPlaybackSDKReady = null;
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  }, [initializePlayer]); // Remove 'player' from dependencies to prevent infinite loop

  // Player controls
  const togglePlay = useCallback((): Promise<void> | undefined => {
    return player?.togglePlay();
  }, [player]);

  const nextTrack = useCallback((): Promise<void> | undefined => {
    return player?.nextTrack();
  }, [player]);

  const previousTrack = useCallback((): Promise<void> | undefined => {
    return player?.previousTrack();
  }, [player]);

  const seek = useCallback(
    (position: number): Promise<void> | undefined => {
      return player?.seek(position);
    },
    [player],
  );

  const setVolume = useCallback(
    (volume: number): Promise<void> | undefined => {
      return player?.setVolume(volume);
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
