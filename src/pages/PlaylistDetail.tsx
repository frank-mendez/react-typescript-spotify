import { useParams } from 'react-router-dom';
import { Play, Heart } from 'lucide-react';
import { usePlaylist } from '../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../hooks/useSpotifyMutations';
import { Skeleton } from '../components/ui/skeleton';
import { ErrorState } from '../components/ui/ErrorState';

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: playlist, isLoading, isError, refetch } = usePlaylist(id ?? '');
  const { play } = usePlaybackControls();

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full" data-testid="playlist-detail-loading">
        {/* Header skeleton */}
        <div className="bg-[linear-gradient(180deg,#5038a0_0%,#121212_100%)] p-8">
          <div className="flex items-end gap-6">
            <Skeleton className="w-48 h-48 rounded-sm shrink-0" />
            <div className="flex flex-col gap-3 flex-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !playlist) {
    return (
      <ErrorState
        message="Failed to load playlist."
        onRetry={() => refetch()}
      />
    );
  }

  const handlePlayPlaylist = () => {
    play.mutate({ context_uri: playlist.uri });
  };

  const coverImage = playlist.images?.[0]?.url;

  return (
    <div className="flex flex-col min-h-full" data-testid="playlist-detail">
      {/* Gradient header */}
      <div className="bg-[linear-gradient(180deg,#5038a0_0%,#121212_100%)] p-8">
        <div className="flex items-end gap-6">
          {coverImage ? (
            <img
              src={coverImage}
              alt={playlist.name}
              className="w-48 h-48 rounded-sm object-cover shrink-0 shadow-2xl"
              data-testid="playlist-cover"
            />
          ) : (
            <div
              className="w-48 h-48 rounded-sm bg-surface shrink-0 shadow-2xl"
              data-testid="playlist-cover-placeholder"
            />
          )}
          <div className="flex flex-col gap-2 min-w-0">
            <span className="text-text-muted text-xs font-semibold uppercase tracking-widest">
              Playlist
            </span>
            <h1 className="text-text-primary text-4xl md:text-5xl font-bold truncate">
              {playlist.name}
            </h1>
            <p className="text-text-muted text-sm">
              <span>{playlist.owner?.display_name}</span>
              {playlist.tracks?.total != null && (
                <>
                  {' · '}
                  <span>{playlist.tracks.total} songs</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handlePlayPlaylist}
            aria-label="Play playlist"
            className="w-12 h-12 rounded-full bg-accent flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Play className="w-5 h-5 text-black fill-black ml-0.5" />
          </button>
          <button
            aria-label="Like playlist"
            className="w-8 h-8 rounded-full border border-text-muted flex items-center justify-center hover:border-text-primary transition-colors"
          >
            <Heart className="w-4 h-4 text-text-muted" />
          </button>
        </div>
      </div>
    </div>
  );
}
