import { useNavigate } from "react-router-dom";
import { useCurrentPlayback } from "../../hooks/useSpotifyQueries";
import { usePlaybackControls, useLibraryControls } from "../../hooks/useSpotifyMutations";
import { TrackInfo } from "./player/TrackInfo";
import { PlaybackControls } from "./player/PlaybackControls";
import { ExtraControls } from "./player/ExtraControls";
import { MiniPlayer } from "./player/MiniPlayer";

export function PlayerBar() {
  const navigate = useNavigate();
  const { data: playback, isLoading } = useCurrentPlayback();
  const { play, pause, next, previous, seek, setVolume, setRepeat, setShuffle } = usePlaybackControls();
  const { saveTrack } = useLibraryControls();

  const track = playback?.item;
  const isPlaying = playback?.is_playing ?? false;
  const progressMs = playback?.progress_ms ?? 0;
  const durationMs = track?.duration_ms ?? 0;
  const volume = playback?.device?.volume_percent ?? 50;
  const shuffleState = playback?.shuffle_state ?? false;
  const repeatState = playback?.repeat_state ?? "off";
  const albumImageUrl = track?.album?.images?.[2]?.url ?? track?.album?.images?.[0]?.url;
  const contextPlaylistId = playback?.context?.uri?.startsWith("spotify:playlist:")
    ? playback.context.uri.split(":")[2]
    : null;

  const handlePlayPause = () => {
    if (isPlaying) {
      pause.mutate(undefined);
    } else {
      play.mutate({ position_ms: progressMs });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-bg/95 backdrop-blur z-50" data-testid="player-bar-element">
      {/* Mobile */}
      <div className="flex md:hidden items-center h-16 px-4 gap-3">
        <MiniPlayer
          track={track}
          isLoading={isLoading}
          isPlaying={isPlaying}
          albumImageUrl={albumImageUrl}
          contextPlaylistId={contextPlaylistId}
          onPlayPause={handlePlayPause}
          onNavigate={navigate}
        />
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between h-[90px] px-4 w-full">
        <div className="flex flex-row items-center" style={{ minWidth: 0, flex: "0 0 auto", maxWidth: "30%" }}>
          <TrackInfo
            track={track}
            isLoading={isLoading}
            albumImageUrl={albumImageUrl}
            saved={false}
            onNavigate={navigate}
            onSave={() => { if (track?.id) saveTrack.mutate(track.id); }}
          />
        </div>

        <PlaybackControls
          isPlaying={isPlaying}
          progressMs={progressMs}
          durationMs={durationMs}
          shuffleState={shuffleState}
          repeatState={repeatState}
          onPlayPause={handlePlayPause}
          onPrevious={() => previous.mutate(undefined)}
          onNext={() => next.mutate(undefined)}
          onShuffle={(state) => setShuffle.mutate({ state })}
          onRepeat={(state) => setRepeat.mutate({ state })}
          onSeek={(positionMs) => seek.mutate({ positionMs })}
        />

        <ExtraControls
          volume={volume}
          onVolumeChange={(v) => setVolume.mutate({ volumePercent: v })}
          onMuteToggle={() => setVolume.mutate({ volumePercent: volume > 0 ? 0 : 50 })}
        />
      </div>
    </div>
  );
}
