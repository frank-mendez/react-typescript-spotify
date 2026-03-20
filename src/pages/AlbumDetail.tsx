import { useParams, useNavigate } from 'react-router-dom';
import { Play, Heart } from 'lucide-react';
import { useAlbum, useAlbumTracks, useCurrentlyPlaying } from '../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../hooks/useSpotifyMutations';
import { Skeleton } from '../components/ui/skeleton';
import { ErrorState } from '../components/ui/ErrorState';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatTotalDuration(totalMs: number): string {
  const totalMinutes = Math.floor(totalMs / 60000);
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
}

export default function AlbumDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: album, isLoading: albumLoading, isError: albumError, refetch: refetchAlbum } = useAlbum(id ?? '');
  const { data: tracksData, isLoading: tracksLoading, isError: tracksError, refetch: refetchTracks } = useAlbumTracks(id ?? '');
  const { data: currentlyPlaying } = useCurrentlyPlaying();
  const { play } = usePlaybackControls();

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
            <div key={i} className="flex items-center gap-4 py-2">
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
  const releaseYear = album.release_date ? new Date(album.release_date).getFullYear() : null;

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

          return (
            <div
              key={`${track.id}-${index}`}
              onClick={() => handlePlayTrack(index)}
              role="row"
              aria-label={`${track.name} by ${track.artists.map((a) => a.name).join(', ')}`}
              className="grid grid-cols-[2rem_1fr_4rem] gap-4 px-2 py-2 rounded hover:bg-[#ffffff10] cursor-pointer group items-center"
            >
              {/* Track index */}
              <span
                className={`text-sm text-right font-medium ${isCurrentTrack ? 'text-accent' : 'text-text-muted'}`}
              >
                {index + 1}
              </span>

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
