import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Heart } from 'lucide-react';
import { useAlbum, useAlbumTracks, useCurrentlyPlaying } from '../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../hooks/useSpotifyMutations';
import { Skeleton } from '../components/ui/skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { formatDuration, formatTotalDuration } from '../lib/utils/formatDuration';

function EqualizerBars() {
  return (
    <span className="inline-flex items-end gap-[2px] w-4 h-4" aria-hidden>
      <span className="inline-block w-[3px] bg-accent rounded-sm animate-eq-bar1" style={{ height: '3px' }} />
      <span className="inline-block w-[3px] bg-accent rounded-sm animate-eq-bar2" style={{ height: '8px' }} />
      <span className="inline-block w-[3px] bg-accent rounded-sm animate-eq-bar3" style={{ height: '12px' }} />
      <span className="inline-block w-[3px] bg-accent rounded-sm animate-eq-bar2" style={{ height: '5px' }} />
    </span>
  );
}

export default function AlbumDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: album, isLoading: albumLoading, isError: albumError, refetch: refetchAlbum } = useAlbum(id ?? '');
  // Pagination note: currently fetches first 50 tracks only. Long albums (live recordings,
  // compilations) may exceed this. Implement useInfiniteQuery or load-more button.
  const { data: tracksData, isLoading: tracksLoading, isError: tracksError, refetch: refetchTracks } = useAlbumTracks(id ?? '');
  const { data: currentlyPlaying } = useCurrentlyPlaying();
  const { play, pause } = usePlaybackControls();

  const isPlaying = currentlyPlaying?.is_playing ?? false;

  const isLoading = albumLoading || tracksLoading;
  const isError = albumError || tracksError;

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full" data-testid="album-detail-loading">
        {/* Header skeleton */}
        <div className="bg-[linear-gradient(180deg,#1a4a6b_0%,#121212_100%)] p-8">
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
            <div key={`skeleton-track-${i}`} className="flex items-center gap-4 py-2">
              <Skeleton className="w-4 h-4" />
              <div className="flex flex-col gap-1 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !album) {
    return (
      <ErrorState
        message="Failed to load album."
        onRetry={() => { refetchAlbum(); refetchTracks(); }}
      />
    );
  }

  const tracks = tracksData?.items ?? [];
  const totalDurationMs = tracks.reduce((sum, track) => sum + (track.duration_ms ?? 0), 0);
  const currentTrackId = currentlyPlaying?.item?.id;

  const handlePlayAlbum = () => {
    play.mutate({ context_uri: album.uri });
  };

  const handlePlayTrack = (index: number) => {
    play.mutate({
      context_uri: album.uri,
      offset: { position: index },
    });
  };

  const coverImage = album.images?.[0]?.url;
  const releaseYear = album.release_date ? Number.parseInt(album.release_date.slice(0, 4), 10) : null;

  return (
    <div className="flex flex-col min-h-full" data-testid="album-detail">
      {/* Gradient header */}
      <div className="bg-[linear-gradient(180deg,#1a4a6b_0%,#121212_100%)] p-8">
        <div className="flex items-end gap-6">
          {coverImage ? (
            <img
              src={coverImage}
              alt={album.name}
              className="w-48 h-48 rounded-sm object-cover shrink-0 shadow-2xl"
              data-testid="album-cover"
            />
          ) : (
            <div
              className="w-48 h-48 rounded-sm bg-surface shrink-0 shadow-2xl"
              data-testid="album-cover-placeholder"
            />
          )}
          <div className="flex flex-col gap-2 min-w-0">
            <span className="text-text-muted text-xs font-semibold uppercase tracking-widest">
              Album
            </span>
            <h1 className="text-text-primary text-4xl md:text-5xl font-bold truncate">
              {album.name}
            </h1>
            <p className="text-text-muted text-sm flex flex-wrap items-center gap-1">
              {album.artists?.[0] && (
                <button
                  onClick={() => navigate(`/artist/${album.artists[0].id}`)}
                  className="hover:text-text-primary hover:underline font-semibold"
                  data-testid="album-artist-link"
                >
                  {album.artists[0].name}
                </button>
              )}
              {releaseYear && (
                <>
                  <span>·</span>
                  <span>{releaseYear}</span>
                </>
              )}
              <span>·</span>
              <span>{album.tracks?.total ?? tracks.length} songs</span>
              {totalDurationMs > 0 && (
                <>
                  <span>,</span>
                  <span>{formatTotalDuration(totalDurationMs)}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handlePlayAlbum}
            aria-label="Play album"
            className="w-12 h-12 rounded-full bg-accent flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Play className="w-5 h-5 text-black fill-black ml-0.5" />
          </button>
          {/* Wire up save/unsave album using useLibraryControls when implemented */}
          <button
            aria-label="Like album"
            className="w-8 h-8 rounded-full border border-text-muted flex items-center justify-center hover:border-text-primary transition-colors"
          >
            <Heart className="w-4 h-4 text-text-muted" />
          </button>
        </div>
      </div>

      {/* Track list */}
      <div className="flex-1 bg-[#121212] px-6 py-4">
        {/* Column headers */}
        <div className="sticky top-0 z-10 bg-[#121212] grid grid-cols-[2rem_1fr_4rem] gap-4 px-2 py-2 border-b border-border mb-2">
          <span className="text-text-muted text-xs font-semibold text-right">#</span>
          <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">Title</span>
          <span className="text-text-muted text-xs font-semibold uppercase tracking-wider text-right">Duration</span>
        </div>

        {/* Track rows */}
        {tracks.map((track, index) => {
          if (!track) return null;
          const isCurrentTrack = track.id === currentTrackId;
          const isActiveAndPlaying = isCurrentTrack && isPlaying;

          const handleRowClick = () => {
            if (isCurrentTrack) {
              isPlaying ? pause.mutate(undefined) : play.mutate({ context_uri: album.uri, offset: { position: index } });
            } else {
              handlePlayTrack(index);
            }
          };

          const handleRowKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleRowClick();
            }
          };

          let trackStateContent;
          if (isActiveAndPlaying) {
            trackStateContent = (
              <>
                <Pause className="w-4 h-4 text-accent fill-accent hidden group-hover:block" />
                <span className="group-hover:hidden"><EqualizerBars /></span>
              </>
            );
          } else if (isCurrentTrack) {
            trackStateContent = (
              <>
                <Play className="w-4 h-4 text-accent fill-accent hidden group-hover:block" />
                <span className="text-sm font-medium text-accent group-hover:hidden">{index + 1}</span>
              </>
            );
          } else {
            trackStateContent = (
              <>
                <Play className="w-4 h-4 text-text-primary fill-text-primary hidden group-hover:block" />
                <span className="text-sm font-medium text-text-muted group-hover:hidden">{index + 1}</span>
              </>
            );
          }

          return (
            <div
              key={`${track.id}-${index}`}
              onClick={handleRowClick}
              onKeyDown={handleRowKeyDown}
              role="button"
              tabIndex={0}
              aria-label={`${track.name} by ${track.artists.map((a) => a.name).join(', ')}`}
              className="grid grid-cols-[2rem_1fr_4rem] gap-4 px-2 py-2 rounded hover:bg-[#ffffff10] cursor-pointer group items-center"
            >
              {/* Track index / play state */}
              <div className="flex items-center justify-end w-full">
                {trackStateContent}
              </div>

              {/* Track info */}
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

              {/* Duration */}
              <span className="text-xs text-text-muted text-right">
                {formatDuration(track.duration_ms)}
              </span>
            </div>
          );
        })}

        {tracks.length === 0 && (
          <p className="text-text-muted text-sm text-center py-12">This album has no tracks.</p>
        )}
      </div>
    </div>
  );
}
