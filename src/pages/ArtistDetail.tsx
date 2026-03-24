import { useParams } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useArtist, useArtistAlbums } from '../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../hooks/useSpotifyMutations';
import { ErrorState } from '../components/ui/ErrorState';
import { ArtistDetailSkeleton } from '../components/features/artist/ArtistDetailSkeleton';
import { ArtistAlbumCard } from '../components/features/artist/ArtistAlbumCard';
import { ScrollArrow } from '../components/ui/ScrollArrow';
import { useCarouselScroll } from '../hooks/useCarouselScroll';

export default function ArtistDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: artist, isLoading: artistLoading, isError: artistError, refetch: refetchArtist } = useArtist(id ?? '');
  const { data: albumsData, isLoading: albumsLoading, isError: albumsError, refetch: refetchAlbums } = useArtistAlbums(id ?? '');
  const { play } = usePlaybackControls();
  const { scrollRef, canScrollLeft, canScrollRight, scroll } = useCarouselScroll(albumsData?.items);

  const isLoading = artistLoading || albumsLoading;
  const isError = artistError || albumsError;

  const albums = (albumsData?.items ?? []).slice(0, 10);
  const artistImage = artist?.images?.[0]?.url;

  if (isLoading) return <ArtistDetailSkeleton />;
  if (isError || !artist) {
    return (
      <ErrorState
        message="Failed to load artist."
        onRetry={() => { refetchArtist(); refetchAlbums(); }}
      />
    );
  }

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
            <div className="w-32 h-32 rounded-full bg-surface shrink-0 shadow-2xl" data-testid="artist-photo-placeholder" />
          )}
          <div className="flex flex-col gap-2 min-w-0">
            <h1 className="text-text-primary text-4xl md:text-6xl font-bold truncate">{artist.name}</h1>
            <p className="text-text-muted text-sm">{artist.followers?.total.toLocaleString()} followers</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={() => play.mutate({ context_uri: artist.uri })}
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

      {/* Albums section */}
      <div className="flex-1 bg-[#121212] px-6 py-6">
        <section>
          <h2 className="text-text-primary text-2xl font-bold mb-4">Albums</h2>
          <div className="relative overflow-hidden">
            {canScrollLeft && <ScrollArrow dir="left" onClick={() => scroll('left')} fromColor="from-[#121212]" />}
            <div
              ref={scrollRef}
              data-testid="albums-scroll-container"
              className="flex gap-4 overflow-x-auto pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {albums.map((album) => (
                <ArtistAlbumCard key={album.id} album={album} />
              ))}
            </div>
            {canScrollRight && <ScrollArrow dir="right" onClick={() => scroll('right')} fromColor="from-[#121212]" />}
          </div>
        </section>
      </div>
    </div>
  );
}
