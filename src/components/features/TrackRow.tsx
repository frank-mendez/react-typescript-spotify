import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Track } from '../../types/spotify';

interface TrackRowProps {
  track: Track;
  onPlay: (uri: string) => void;
}

export function TrackRow({ track, onPlay }: TrackRowProps) {
  const navigate = useNavigate();
  // Spotify images are ordered largest→smallest; prefer index 2 (~64px thumbnail), fall back to index 0 (largest)
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
            alt=""
            data-testid="track-art-img"
            className="w-10 h-10 rounded object-cover"
          />
        ) : (
          <div data-testid="track-art-placeholder" className="w-10 h-10 rounded bg-border" />
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
          {track.artists.map((artist, index) => (
            <span key={artist.id}>
              {index > 0 && ', '}
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/artist/' + artist.id); }}
                className="hover:underline cursor-pointer"
              >
                {artist.name}
              </button>
            </span>
          ))}
        </span>
        {track.album && (
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/album/' + track.album!.id); }}
            className="text-text-muted text-xs truncate hover:underline cursor-pointer text-left"
          >
            {track.album.name}
          </button>
        )}
      </div>
    </button>
  );
}
