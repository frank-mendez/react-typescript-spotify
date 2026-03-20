import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Slider } from "../ui/slider";
import { Skeleton } from "../ui/skeleton";
import { useCurrentPlayback } from "../../hooks/useSpotifyQueries";
import { usePlaybackControls } from "../../hooks/useSpotifyMutations";
import type { Track } from "../../types/spotify";

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getNextRepeatState(current: string): "off" | "context" | "track" {
  if (current === "off") return "context";
  if (current === "context") return "track";
  return "off";
}

function DesktopTrackInfo({
  track,
  isLoading,
  albumImageUrl,
  onNavigate,
}: Readonly<{
  track: Track | undefined;
  isLoading: boolean;
  albumImageUrl: string | undefined;
  onNavigate: (path: string) => void;
}>) {
  if (isLoading) {
    return (
      <>
        <Skeleton className="w-12 h-12 rounded shrink-0" />
        <div className="flex flex-col gap-1 min-w-0">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </>
    );
  }
  if (!track) {
    return <span className="text-text-muted text-xs">Nothing playing</span>;
  }
  return (
    <>
      <img
        src={albumImageUrl}
        alt={track.album?.name}
        className="w-12 h-12 rounded shrink-0 object-cover"
      />
      <div className="flex flex-col min-w-0">
        <span className="text-text-primary text-sm font-medium truncate">
          {track.name}
        </span>
        <button
          onClick={() => onNavigate('/artist/' + track.artists[0].id)}
          className="text-text-muted text-xs truncate hover:underline cursor-pointer text-left"
        >
          {track.artists.map((a) => a.name).join(", ")}
        </button>
      </div>
    </>
  );
}

export function PlayerBar() {
  const navigate = useNavigate();
  const { data: playback, isLoading } = useCurrentPlayback();
  const {
    play,
    pause,
    next,
    previous,
    seek,
    setVolume,
    setRepeat,
    setShuffle,
  } = usePlaybackControls();

  const track = playback?.item;
  const isPlaying = playback?.is_playing ?? false;
  const progressMs = playback?.progress_ms ?? 0;
  const durationMs = track?.duration_ms ?? 0;
  const volume = playback?.device?.volume_percent ?? 50;
  const shuffleState = playback?.shuffle_state ?? false;
  const repeatState = playback?.repeat_state ?? "off";
  const albumImageUrl =
    track?.album?.images?.[2]?.url ?? track?.album?.images?.[0]?.url;
  const contextPlaylistId = playback?.context?.uri?.startsWith('spotify:playlist:')
    ? playback.context.uri.split(':')[2]
    : null;

  const handlePlayPause = () => {
    if (isPlaying) {
      pause.mutate(undefined);
    } else {
      play.mutate({ position_ms: progressMs });
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50"
      data-testid="player-bar-element"
    >
      {/* Mobile mini-player: 64px strip with album art, title, and play/pause */}
      <div className="flex md:hidden items-center h-16 px-4 gap-3">
        {isLoading ? (
          <>
            <Skeleton className="w-10 h-10 rounded shrink-0" />
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          </>
        ) : (
          <>
            {track ? (
              <img
                src={albumImageUrl}
                alt={track.album?.name}
                className="w-10 h-10 rounded shrink-0 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded shrink-0 bg-surface-hover" />
            )}
            <div className="flex flex-col flex-1 min-w-0">
              <span
                onClick={contextPlaylistId ? () => navigate('/playlist/' + contextPlaylistId) : undefined}
                className={`text-text-primary text-sm font-medium truncate${contextPlaylistId ? ' hover:underline cursor-pointer' : ''}`}
              >
                {track ? track.name : "Nothing playing"}
              </span>
              {track && (
                <button
                  onClick={() => navigate('/artist/' + track.artists[0].id)}
                  className="text-text-muted text-xs truncate hover:underline cursor-pointer text-left"
                >
                  {track.artists.map((a) => a.name).join(", ")}
                </button>
              )}
            </div>
            <button
              onClick={handlePlayPause}
              className="w-8 h-8 bg-text-primary rounded-full flex items-center justify-center hover:scale-105 transition-transform text-bg shrink-0"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Desktop full player */}
      <div className="hidden md:flex items-center h-20 px-4 gap-4">
        {/* Track info */}
        <div className="flex items-center gap-3 w-56 min-w-0 shrink-0">
          <DesktopTrackInfo
            track={track}
            isLoading={isLoading}
            albumImageUrl={albumImageUrl}
            onNavigate={navigate}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-1 flex-1 max-w-lg mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShuffle.mutate({ state: !shuffleState })}
              className={`text-text-muted hover:text-text-primary transition-colors ${shuffleState ? "text-accent" : ""}`}
              aria-label="Toggle shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={() => previous.mutate(undefined)}
              className="text-text-muted hover:text-text-primary transition-colors"
              aria-label="Previous track"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={handlePlayPause}
              className="w-8 h-8 bg-text-primary rounded-full flex items-center justify-center hover:scale-105 transition-transform text-bg"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => next.mutate(undefined)}
              className="text-text-muted hover:text-text-primary transition-colors"
              aria-label="Next track"
            >
              <SkipForward className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                setRepeat.mutate({ state: getNextRepeatState(repeatState) })
              }
              className={`text-text-muted hover:text-text-primary transition-colors ${repeatState === "off" ? "" : "text-accent"}`}
              aria-label="Toggle repeat"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <span className="text-text-muted text-xs tabular-nums w-8 text-right">
              {formatMs(progressMs)}
            </span>
            <Slider
              value={[progressMs]}
              max={durationMs || 1}
              step={1000}
              onValueCommitted={(value) =>
                seek.mutate({
                  positionMs: Array.isArray(value) ? value[0] : value,
                })
              }
              className="flex-1"
              aria-label="Track progress"
            />
            <span className="text-text-muted text-xs tabular-nums w-8">
              {formatMs(durationMs)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-36 shrink-0 justify-end">
          <button
            onClick={() =>
              setVolume.mutate({ volumePercent: volume > 0 ? 0 : 50 })
            }
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label={volume === 0 ? "Unmute" : "Mute"}
          >
            {volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueCommitted={(value) =>
              setVolume.mutate({
                volumePercent: Array.isArray(value) ? value[0] : value,
              })
            }
            className="w-24"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
