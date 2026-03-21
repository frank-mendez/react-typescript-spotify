import { useNavigate } from 'react-router-dom';
import { Pause, Play } from 'lucide-react';
import type { Playlist } from '../../../types/spotify';

export interface PlaylistCardProps {
  playlist: Playlist;
  onPlay: (uri: string) => void;
  onPause: () => void;
  isActive: boolean;
  isPlaying: boolean;
}

export function PlaylistCard({ playlist, onPlay, onPause, isActive, isPlaying }: Readonly<PlaylistCardProps>) {
  const navigate = useNavigate();
  const image = playlist.images?.[0]?.url;
  const initials = playlist.name.slice(0, 2).toUpperCase();

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive && isPlaying) {
      onPause();
    } else {
      onPlay(playlist.uri);
    }
  };

  return (
    <button
      data-testid="playlist-card"
      className="flex flex-col gap-2 w-40 shrink-0 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-md"
      onClick={() => navigate(`/playlist/${playlist.id}`)}
    >
      <div className="relative w-40 h-40 rounded-md overflow-hidden bg-surface-hover">
        {image ? (
          <img
            src={image}
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-accent/20 text-accent font-bold text-2xl">
            {initials}
          </div>
        )}

        <button
          aria-label={isActive && isPlaying ? `Pause ${playlist.name}` : `Play ${playlist.name}`}
          onClick={handlePlayPause}
          className={`absolute bottom-2 right-2 w-9 h-9 rounded-full bg-accent flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}`}
        >
          {isActive && isPlaying ? (
            <>
              <span className="group-hover:hidden flex items-end gap-[2px] h-4">
                <span className="w-[3px] bg-black rounded-sm animate-eq-bar1" />
                <span className="w-[3px] bg-black rounded-sm animate-eq-bar2" />
                <span className="w-[3px] bg-black rounded-sm animate-eq-bar3" />
              </span>
              <Pause className="hidden group-hover:flex w-4 h-4 text-black fill-black" />
            </>
          ) : (
            <Play className="w-4 h-4 text-black fill-black ml-0.5" />
          )}
        </button>
      </div>

      <div className="px-0.5">
        <p className="text-text-primary text-sm font-semibold truncate">{playlist.name}</p>
        {playlist.description && (
          <p className="text-text-muted text-xs truncate mt-0.5">{playlist.description}</p>
        )}
      </div>
    </button>
  );
}
