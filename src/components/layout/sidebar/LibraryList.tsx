import { Skeleton } from '../../ui/skeleton';
import { LibraryListItem } from './LibraryListItem';
import type { LibraryItem } from './types';

interface LibraryListProps {
  isLoading: boolean;
  items: LibraryItem[];
  searchQuery: string;
  onNavigate: (item: LibraryItem) => void;
  onPlay: (item: LibraryItem, e: React.MouseEvent) => void;
}

function LoadingSkeletons() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={`skeleton-library-${i}`} className="flex items-center gap-3 px-2 py-2">
          <Skeleton className="w-12 h-12 rounded shrink-0" />
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </>
  );
}

export function LibraryList({ isLoading, items, searchQuery, onNavigate, onPlay }: Readonly<LibraryListProps>) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
      <div className="px-2 pb-4">
        {isLoading && <LoadingSkeletons />}

        {!isLoading && items.map((item) => (
          <LibraryListItem
            key={`${item.type}-${item.id}`}
            item={item}
            onNavigate={onNavigate}
            onPlay={onPlay}
          />
        ))}

        {!isLoading && items.length === 0 && (
          <p className="text-[#b3b3b3] text-xs px-2 py-4 text-center">
            {searchQuery ? 'No results found' : 'No items in your library'}
          </p>
        )}
      </div>
    </div>
  );
}
