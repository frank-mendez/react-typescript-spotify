import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type RecentItem = {
  id: string;
  name: string;
  imageUrl?: string;
  type: 'album' | 'artist';
  uri: string;
  navigationPath: string;
  subtitle: string;
};

interface RecentlyPlayedCardProps {
  item: RecentItem;
  onPlay: (uri: string) => void;
}

export function RecentlyPlayedCard({ item, onPlay }: Readonly<RecentlyPlayedCardProps>) {
  const navigate = useNavigate();
  const initials = item.name.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors group overflow-hidden">
      {/* Card body: image + text, handles navigation */}
      <div
        data-testid="card-body"
        className="flex flex-1 items-center min-w-0 cursor-pointer"
        onClick={() => navigate(item.navigationPath)}
        onKeyDown={(e) => { if (e.key === 'Enter') navigate(item.navigationPath); }}
        role="link"
        tabIndex={0}
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
      </div>

      {/* Play button — sibling of card-body, not nested inside role="link" */}
      <div className="pr-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          aria-label={`Play ${item.name}`}
          onClick={(e) => { e.stopPropagation(); onPlay(item.uri); }}
          className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shadow-lg hover:scale-105 transition-transform focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          <Play className="w-4 h-4 text-black fill-black ml-0.5" />
        </button>
      </div>
    </div>
  );
}
