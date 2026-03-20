import { Skeleton } from "../../ui/skeleton";
import { AddToLibraryIcon } from "../../icons/player";
import type { Track } from "../../../types/spotify";

interface TrackInfoProps {
  track: Track | undefined;
  isLoading: boolean;
  albumImageUrl: string | undefined;
  saved: boolean;
  onNavigate: (path: string) => void;
  onSave: () => void;
}

export function TrackInfo({ track, isLoading, albumImageUrl, saved, onNavigate, onSave }: Readonly<TrackInfoProps>) {
  if (isLoading) {
    return (
      <>
        <Skeleton className="w-14 h-14 rounded shrink-0" />
        <div className="flex flex-col gap-1 min-w-0">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </>
    );
  }

  if (!track) {
    return <span className="text-[#b3b3b3] text-xs">Nothing playing</span>;
  }

  return (
    <>
      <div className="relative shrink-0" style={{ marginRight: 15 }}>
        <img src={albumImageUrl} alt="Album Cover" className="w-14 h-14 object-cover" />
      </div>

      <div className="min-w-0">
        <p className="text-white font-bold text-sm truncate" title={track.name}>
          {track.name}
        </p>
        <span className="text-[#b3b3b3] text-xs truncate block">
          {track.artists.map((a, i) => (
            <span key={a.id}>
              {i > 0 && ", "}
              <button onClick={() => onNavigate("/artist/" + a.id)} className="hover:text-white hover:underline">
                {a.name}
              </button>
            </span>
          ))}
        </span>
      </div>

      <button onClick={onSave} className="ml-3 shrink-0 hover:opacity-80 transition-opacity" aria-label="Add to library">
        <AddToLibraryIcon saved={saved} />
      </button>
    </>
  );
}
