import { useParams, useNavigate } from 'react-router-dom';
import { Play, Heart } from 'lucide-react';
import { usePlaylist, usePlaylistItems, useCurrentlyPlaying } from '../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../hooks/useSpotifyMutations';
import { Skeleton } from '../components/ui/skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { formatDuration, formatTotalDuration } from '../lib/utils/formatDuration';

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: playlist, isLoading: playlistLoading, isError: playlistError, refetch: refetchPlaylist } = usePlaylist(id ?? '');
  // TODO: Pagination — currently fetches first 50 tracks only. For playlists > 50 tracks,
  // implement useInfiniteQuery or a load-more button to fetch additional pages.
  const { data: items, isLoading: itemsLoading, isError: itemsError, refetch: refetchItems } = usePlaylistItems(id ?? '');
  const { data: currentlyPlaying } = useCurrentlyPlaying();
  const { play } = usePlaybackControls();

  const isLoading = playlistLoading || itemsLoading;
  const isError = playlistError || itemsError;

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
        {/* Track rows skeleton */}
        <div className="flex-1 bg-[#121212] px-6 py-4 flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="w-10 h-10 rounded" />
              <div className="flex flex-col gap-1 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-32 hidden md:block" />
              <Skeleton className="h-4 w-10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !playlist) {
    return (
      <ErrorState
        message="Failed to load playlist."
        onRetry={() => { refetchPlaylist(); refetchItems(); }}
      />
    );
  }

  const tracks = items?.items ?? [];
  const totalDurationMs = tracks.reduce((sum, item) => sum + (item.track?.duration_ms ?? 0), 0);
  const currentTrackId = currentlyPlaying?.item?.id;

  const handlePlayPlaylist = () => {
    play.mutate({ context_uri: playlist.uri });
  };

  const handlePlayTrack = (index: number) => {
    play.mutate({
      context_uri: playlist.uri,
      offset: { position: index },
    });
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
              {' · '}
              <span>{playlist.tracks.total} songs</span>
              {totalDurationMs > 0 && (
                <>
                  {', '}
                  <span>{formatTotalDuration(totalDurationMs)}</span>
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

      {/* Track list */}
      <div className="flex-1 bg-[#121212] px-6 py-4">
        {/* Column headers */}
        <div className="sticky top-0 z-10 bg-[#121212] grid grid-cols-[2rem_1fr_1fr_4rem] gap-4 px-2 py-2 border-b border-border mb-2">
          <span className="text-text-muted text-xs font-semibold text-right">#</span>
          <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">Title</span>
          <span className="text-text-muted text-xs font-semibold uppercase tracking-wider hidden md:block">Album</span>
          <span className="text-text-muted text-xs font-semibold uppercase tracking-wider text-right">Duration</span>
        </div>

        {/* Track rows */}
        {tracks.map((item, index) => {
          const track = item.track;
          if (!track) return null;
          const isCurrentTrack = track.id === currentTrackId;
          const albumThumb = track.album?.images?.[2]?.url ?? track.album?.images?.[0]?.url;

          return (
            <div
              key={`${track.id}-${index}`}
              onClick={() => handlePlayTrack(index)}
              role="row"
              aria-label={`${track.name} by ${track.artists.map((a) => a.name).join(', ')}`}
              className="grid grid-cols-[2rem_1fr_1fr_4rem] gap-4 px-2 py-2 rounded hover:bg-[#ffffff10] cursor-pointer group items-center"
            >
              {/* Track index */}
              <span
                className={`text-sm text-right font-medium ${isCurrentTrack ? 'text-accent' : 'text-text-muted'}`}
              >
                {index + 1}
              </span>

              {/* Track info */}
              <div className="flex items-center gap-3 min-w-0">
                {albumThumb ? (
                  <img
                    src={albumThumb}
                    alt=""
                    className="w-10 h-10 rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-border shrink-0" />
                )}
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-sm truncate font-medium ${isCurrentTrack ? 'text-accent' : 'text-text-primary'}`}
                  >
                    {track.name}
                  </span>
                  <span className="text-xs text-text-muted truncate">
                    {track.artists.map((artist, i) => (
                      <span key={artist.id}>
                        {i > 0 && ', '}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/artist/${artist.id}`);
                          }}
                          className="hover:text-text-primary hover:underline"
                        >
                          {artist.name}
                        </button>
                      </span>
                    ))}
                  </span>
                </div>
              </div>

              {/* Album name */}
              <div className="hidden md:block min-w-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (track.album) navigate(`/album/${track.album.id}`);
                  }}
                  className="text-xs text-text-muted truncate hover:text-text-primary hover:underline max-w-full text-left"
                >
                  {track.album?.name}
                </button>
              </div>

              {/* Duration */}
              <span className="text-xs text-text-muted text-right">
                {formatDuration(track.duration_ms)}
              </span>
            </div>
          );
        })}

        {tracks.length === 0 && (
          <p className="text-text-muted text-sm text-center py-12">This playlist is empty.</p>
        )}
      </div>
    </div>
  );
}
