import { Play } from 'lucide-react';
import type { Track } from '../../types/spotify';

interface TrackRowProps {
  track: Track;
  onPlay: (uri: string) => void;
}

export function TrackRow({ track, onPlay }: TrackRowProps) {
  const imageUrl =
    track.album?.images?.[2]?.url ?? track.album?.images?.[0]?.url;

  return (
    <button
      onClick={() => onPlay(track.uri)}
      className="group flex items-center gap-3 p-2 rounded hover:bg-surface-hover transition-colors text-left w-full"
    >
      {/* Album art with decorative hover play overlay */}
      <div className="relative w-10 h-10 shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={track.album?.name}
            className="w-10 h-10 rounded object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-border" />
        )}
        {/* Decorative overlay — pointer-events-none so clicks pass to the outer button */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Play className="w-4 h-4 text-white fill-white" />
        </div>
      </div>

      {/* Track info — provides accessible name for the outer button */}
      <div className="flex flex-col min-w-0">
        <span className="text-text-primary text-sm truncate">{track.name}</span>
        <span className="text-text-muted text-xs truncate">
          {track.artists.map((a) => a.name).join(', ')}
        </span>
      </div>
    </button>
  );
}
