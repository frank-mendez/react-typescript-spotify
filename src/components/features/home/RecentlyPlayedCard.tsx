import { Pause, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export type RecentItem = {
  id: string;
  name: string;
  imageUrl?: string;
  type: 'track';
  uri: string;
  navigationPath: string;
  subtitle: string;
};

interface RecentlyPlayedCardProps {
  item: RecentItem;
  onPlay: (uri: string) => void;
  onPause: () => void;
  isActive: boolean;
  isPlaying: boolean;
}

export function RecentlyPlayedCard({ item, onPlay, onPause, isActive, isPlaying }: Readonly<RecentlyPlayedCardProps>) {
  const initials = item.name.slice(0, 2).toUpperCase();

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive && isPlaying) {
      onPause();
    } else {
      onPlay(item.uri);
    }
  };

  return (
    <div className="flex items-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors group overflow-hidden">
      {/* Card body: image + text, handles navigation */}
      <Link
        data-testid="card-body"
        to={item.navigationPath}
        className="flex flex-1 items-center min-w-0 cursor-pointer"
      >
        {/* Image / initials fallback */}
        <div className="w-16 h-16 shrink-0">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-16 h-16 object-cover"
            />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center bg-accent/20 text-accent font-bold text-lg">
              {initials}
            </div>
          )}
        </div>

        {/* Text */}
        <div className="flex-1 px-3 min-w-0">
          <p className="text-text-primary text-sm font-medium truncate">{item.name}</p>
          <p className="text-text-muted text-xs truncate">{item.subtitle}</p>
        </div>
      </Link>

      {/* Play/Pause button — sibling of card-body, not nested inside link */}
      <div className={`pr-3 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'}`}>
        <button
          aria-label={isActive && isPlaying ? `Pause ${item.name}` : `Play ${item.name}`}
          onClick={handlePlayPause}
          className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shadow-lg hover:scale-105 transition-transform focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          {/* Equalizer animation when active+playing, pause on hover; otherwise play icon */}
          {isActive && isPlaying ? (
            <>
              <span className="group-hover:hidden flex items-end gap-[2px] h-4">
                <span className="w-[3px] bg-black rounded-sm animate-eq-bar1" />
                <span className="w-[3px] bg-black rounded-sm animate-eq-bar2" />
                <span className="w-[3px] bg-black rounded-sm animate-eq-bar3" />
              </span>
              <Pause className="hidden group-hover:block w-4 h-4 text-black fill-black" />
            </>
          ) : (
            <Play className="w-4 h-4 text-black fill-black ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}
