import { Skeleton } from "../../ui/skeleton";
import { PlayIcon, PauseIcon } from "../../icons/player";
import type { Track } from "../../../types/spotify";

interface MiniPlayerProps {
  track: Track | undefined;
  isLoading: boolean;
  isPlaying: boolean;
  albumImageUrl: string | undefined;
  contextPlaylistId: string | null;
  onPlayPause: () => void;
  onNavigate: (path: string) => void;
}

export function MiniPlayer({
  track,
  isLoading,
  isPlaying,
  albumImageUrl,
  contextPlaylistId,
  onPlayPause,
  onNavigate,
}: Readonly<MiniPlayerProps>) {
  if (isLoading) {
    return (
      <>
        <Skeleton className="w-10 h-10 rounded shrink-0" />
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      </>
    );
  }

  return (
    <>
      {track ? (
        <img src={albumImageUrl} alt={track.album?.name} className="w-10 h-10 rounded shrink-0 object-cover" />
      ) : (
        <div className="w-10 h-10 rounded shrink-0 bg-[#282828]" />
      )}

      <div className="flex flex-col flex-1 min-w-0">
        {contextPlaylistId ? (
          <button
            onClick={() => onNavigate("/playlist/" + contextPlaylistId)}
            className="hover:underline cursor-pointer text-white text-sm font-bold truncate text-left"
          >
            {track ? track.name : "Nothing playing"}
          </button>
        ) : (
          <span className="text-white text-sm font-bold truncate">
            {track ? track.name : "Nothing playing"}
          </span>
        )}
        {track && (
          <span className="text-[#b3b3b3] text-xs truncate">
            {track.artists.map((a, i) => (
              <span key={a.id}>
                {i > 0 && ", "}
                <button onClick={() => onNavigate("/artist/" + a.id)} className="hover:underline cursor-pointer">
                  {a.name}
                </button>
              </span>
            ))}
          </span>
        )}
      </div>

      <button
        onClick={onPlayPause}
        className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shrink-0"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
    </>
  );
}
