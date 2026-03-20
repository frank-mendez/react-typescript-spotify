import { useParams, useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useArtist, useArtistAlbums } from '../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../hooks/useSpotifyMutations';
import { Skeleton } from '../components/ui/skeleton';
import { ErrorState } from '../components/ui/ErrorState';

export default function ArtistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: artist, isLoading: artistLoading, isError: artistError, refetch: refetchArtist } = useArtist(id ?? '');
  const { data: albumsData, isLoading: albumsLoading, isError: albumsError, refetch: refetchAlbums } = useArtistAlbums(id ?? '');
  const { play } = usePlaybackControls();

  const isLoading = artistLoading || albumsLoading;
  const isError = artistError || albumsError;

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full" data-testid="artist-detail-loading">
        {/* Hero skeleton */}
        <div className="bg-[linear-gradient(180deg,#1a5a4a_0%,#121212_100%)] p-8">
          <div className="flex items-end gap-6">
            <Skeleton className="w-32 h-32 rounded-full shrink-0" />
            <div className="flex flex-col gap-3 flex-1">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="w-24 h-9 rounded-full" />
          </div>
        </div>
        {/* Popular tracks skeleton */}
        <div className="flex-1 bg-[#121212] px-6 py-4 flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`skeleton-artist-${i}`} className="flex items-center gap-4 py-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="w-10 h-10 rounded" />
              <div className="flex flex-col gap-1 flex-1">
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !artist) {
    return (
      <ErrorState
        message="Failed to load artist."
        onRetry={() => { refetchArtist(); refetchAlbums(); }}
      />
    );
  }

  const albums = (albumsData?.items ?? []).slice(0, 10);

  const artistImage = artist.images?.[0]?.url;

  return (
    <div className="flex flex-col min-h-full" data-testid="artist-detail">
      {/* Hero section */}
      <div className="bg-[linear-gradient(180deg,#1a5a4a_0%,#121212_100%)] p-8">
        <div className="flex items-end gap-6">
          {artistImage ? (
            <img
              src={artistImage}
              alt={artist.name}
              className="w-32 h-32 rounded-full object-cover shrink-0 shadow-2xl"
              data-testid="artist-photo"
            />
          ) : (
            <div
              className="w-32 h-32 rounded-full bg-surface shrink-0 shadow-2xl"
              data-testid="artist-photo-placeholder"
            />
          )}
          <div className="flex flex-col gap-2 min-w-0">
            <h1 className="text-text-primary text-4xl md:text-6xl font-bold truncate">
              {artist.name}
            </h1>
            <p className="text-text-muted text-sm">
              {artist.followers?.total.toLocaleString()} followers
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={() => {
              play.mutate({ context_uri: artist.uri });
            }}
            aria-label="Play artist"
            className="w-12 h-12 rounded-full bg-accent flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Play className="w-5 h-5 text-black fill-black ml-0.5" />
          </button>
          {/* Wire up follow/unfollow artist when mutation support is added */}
          <button
            aria-label="Follow artist"
            className="px-6 py-2 rounded-full border border-text-muted text-text-muted text-sm font-semibold hover:border-text-primary hover:text-text-primary transition-colors"
          >
            Follow
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 bg-[#121212] px-6 py-6">
        {/* Albums section */}
        <section>
          <h2 className="text-text-primary text-2xl font-bold mb-4">Albums</h2>
          <div className="overflow-x-auto">
            <div className="flex flex-row gap-4 pb-4">
              {albums.map((album) => {
                const albumCover = album.images?.[0]?.url;
                const releaseYear = album.release_date ? album.release_date.slice(0, 4) : null;

                return (
                  <div
                    key={album.id}
                    onClick={() => navigate(`/album/${album.id}`)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/album/${album.id}`); } }}
                    role="button"
                    tabIndex={0}
                    aria-label={album.name}
                    className="w-40 shrink-0 cursor-pointer group"
                    data-testid={`album-card-${album.id}`}
                  >
                    {albumCover ? (
                      <img
                        src={albumCover}
                        alt={album.name}
                        className="w-full aspect-square object-cover rounded mb-2"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-surface rounded mb-2" />
                    )}
                    <p className="text-text-primary text-sm font-bold truncate">{album.name}</p>
                    {releaseYear && (
                      <p className="text-text-muted text-xs mt-0.5">{releaseYear}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
