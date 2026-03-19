import { useState, useEffect } from 'react';
import { useSearchQuery } from '../../hooks/useSpotifyQueries';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { Search as SearchIcon } from 'lucide-react';
import type { Track, Artist } from '../../types/spotify';

function useDebounced(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounced(query, 300);

  const { data, isLoading, error, refetch } = useSearchQuery(
    debouncedQuery,
    ['track', 'artist', 'album', 'playlist'],
  );

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="relative max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Artists, songs, or podcasts"
          className="pl-9 bg-surface border-border text-text-primary placeholder:text-text-muted"
          autoFocus
        />
      </div>

      {!debouncedQuery && (
        <EmptyState title="Search for music" description="Find songs, artists, albums, and playlists" />
      )}

      {debouncedQuery && isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-square w-full rounded" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {debouncedQuery && error && (
        <ErrorState message="Search failed" onRetry={() => refetch()} />
      )}

      {debouncedQuery && data && (
        <div className="flex flex-col gap-8">
          {data.tracks?.items && data.tracks.items.length > 0 && (
            <section>
              <h2 className="text-text-primary font-bold mb-3">Songs</h2>
              <div className="flex flex-col">
                {data.tracks.items.slice(0, 5).map((track: Track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-surface-hover transition-colors"
                  >
                    <img
                      src={track.album?.images?.[2]?.url}
                      alt={track.album?.name}
                      className="w-10 h-10 rounded object-cover shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-text-primary text-sm truncate">{track.name}</span>
                      <span className="text-text-muted text-xs truncate">
                        {track.artists.map((a) => a.name).join(', ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.artists?.items && data.artists.items.length > 0 && (
            <section>
              <h2 className="text-text-primary font-bold mb-3">Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.artists.items.slice(0, 4).map((artist: Artist) => (
                  <div
                    key={artist.id}
                    className="flex flex-col items-center gap-2 p-4 bg-surface-hover rounded-lg hover:bg-border transition-colors cursor-pointer"
                  >
                    <img
                      src={artist.images?.[0]?.url}
                      alt={artist.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                    <span className="text-text-primary text-sm font-medium text-center truncate w-full">
                      {artist.name}
                    </span>
                    <span className="text-text-muted text-xs">Artist</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
