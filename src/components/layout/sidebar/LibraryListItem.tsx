import type { LibraryItem } from './types';

function PlayButtonOverlay({ onPlay }: Readonly<{ onPlay: (e: React.MouseEvent) => void }>) {
  return (
    <button
      onClick={onPlay}
      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[inherit]"
      aria-label="Play"
    >
      <div className="w-8 h-8 bg-[#1db954] rounded-full flex items-center justify-center shadow-lg">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="black">
          <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606" />
        </svg>
      </div>
    </button>
  );
}

interface LibraryListItemProps {
  item: LibraryItem;
  onNavigate: (item: LibraryItem) => void;
  onPlay: (item: LibraryItem, e: React.MouseEvent) => void;
}

export function LibraryListItem({ item, onNavigate, onPlay }: Readonly<LibraryListItemProps>) {
  return (
    <button
      key={`${item.type}-${item.id}`}
      onClick={() => onNavigate(item)}
      className="group flex items-center gap-3 px-2 py-2 rounded hover:bg-white/10 transition-colors text-left w-full"
    >
      <div className={`relative shrink-0 w-12 h-12 ${item.isArtist ? 'rounded-full' : 'rounded'} overflow-hidden bg-[#2a2a2a]`}>
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-[#333]" />
        }
        <PlayButtonOverlay onPlay={(e) => onPlay(item, e)} />
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-white text-sm font-medium truncate leading-tight">{item.name}</span>
        <span className="text-[#b3b3b3] text-xs truncate leading-tight mt-0.5">{item.subtitle}</span>
      </div>
    </button>
  );
}
