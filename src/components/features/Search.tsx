import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchQuery } from "../../hooks/useSpotifyQueries";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { EmptyState } from "../ui/EmptyState";
import { ErrorState } from "../ui/ErrorState";
import { Search as SearchIcon } from "lucide-react";
import type { Track, Artist, Album, Playlist } from "../../types/spotify";
import { useContentStore } from "../../stores/useContentStore";
import { usePlayerStore } from "../../stores/usePlayerStore";
import { TrackRow } from "./TrackRow";
import { usePlaybackControls } from "../../hooks/useSpotifyMutations";

function useDebounced(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function Search() {
  const navigate = useNavigate();
  const { searchQuery: initialQuery } = useContentStore();
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounced(query, 300);

  const { data, isLoading, error, refetch } = useSearchQuery(debouncedQuery, [
    "track",
    "artist",
    "album",
    "playlist",
  ]);

  const { play } = usePlaybackControls();
  const { mutate: playTrack } = play;
  const { deviceId } = usePlayerStore();

  const handlePlay = useCallback(
    (uri: string) =>
      playTrack({ uris: [uri], device_id: deviceId ?? undefined }),
    [playTrack, deviceId],
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
        <EmptyState
          title="Search for music"
          description="Find songs, artists, albums, and playlists"
        />
      )}

      {debouncedQuery && isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {["sk-0", "sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6", "sk-7"].map(
            (id) => (
              <div key={id} className="flex flex-col gap-2">
                <Skeleton className="aspect-square w-full rounded" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ),
          )}
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
                {data.tracks.items.filter(Boolean).slice(0, 5).map((track: Track) => (
                  <TrackRow key={track.id} track={track} onPlay={handlePlay} />
                ))}
              </div>
            </section>
          )}

          {data.artists?.items && data.artists.items.length > 0 && (
            <section>
              <h2 className="text-text-primary font-bold mb-3">Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.artists.items.filter(Boolean).slice(0, 4).map((artist: Artist) => (
                  <button
                    key={artist.id}
                    type="button"
                    onClick={() => navigate('/artist/' + artist.id)}
                    className="flex flex-col items-center gap-2 p-4 bg-surface-hover rounded-lg hover:bg-border transition-colors cursor-pointer text-left"
                  >
                    {artist.images?.[0]?.url ? (
                      <img
                        src={artist.images[0].url}
                        alt={artist.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-border" />
                    )}
                    <span className="text-text-primary text-sm font-medium text-center truncate w-full">
                      {artist.name}
                    </span>
                    <span className="text-text-muted text-xs">Artist</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {data.albums?.items && data.albums.items.length > 0 && (
            <section>
              <h2 className="text-text-primary font-bold mb-3">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.albums.items.filter(Boolean).slice(0, 4).map((album: Album) => (
                  <button
                    key={album.id}
                    type="button"
                    onClick={() => navigate('/album/' + album.id)}
                    className="flex flex-col gap-2 p-3 bg-surface-hover rounded-lg hover:bg-border transition-colors cursor-pointer text-left w-full"
                  >
                    {album.images?.[0]?.url ? (
                      <img
                        src={album.images[0].url}
                        alt={album.name}
                        className="w-full aspect-square object-cover rounded"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-border rounded" />
                    )}
                    <span className="text-text-primary text-sm font-medium truncate">
                      {album.name}
                    </span>
                    <span className="text-text-muted text-xs truncate">
                      {album.artists.map((a) => a.name).join(', ')}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {data.playlists?.items && data.playlists.items.length > 0 && (
            <section>
              <h2 className="text-text-primary font-bold mb-3">Playlists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.playlists.items.filter(Boolean).slice(0, 4).map((playlist: Playlist) => (
                  <button
                    key={playlist.id}
                    type="button"
                    onClick={() => navigate('/playlist/' + playlist.id)}
                    className="flex flex-col gap-2 p-3 bg-surface-hover rounded-lg hover:bg-border transition-colors cursor-pointer text-left w-full"
                  >
                    {playlist.images?.[0]?.url ? (
                      <img
                        src={playlist.images[0].url}
                        alt={playlist.name}
                        className="w-full aspect-square object-cover rounded"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-border rounded" />
                    )}
                    <span className="text-text-primary text-sm font-medium truncate">
                      {playlist.name}
                    </span>
                    <span className="text-text-muted text-xs">Playlist</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
