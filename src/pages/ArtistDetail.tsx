import { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { useArtist, useArtistAlbums } from '../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../hooks/useSpotifyMutations';
import { ErrorState } from '../components/ui/ErrorState';
import { ArtistDetailSkeleton } from '../components/features/artist/ArtistDetailSkeleton';
import { ArtistAlbumCard } from '../components/features/artist/ArtistAlbumCard';

const CARD_WIDTH = 168;

function ScrollArrow({ dir, onClick }: Readonly<{ dir: 'left' | 'right'; onClick: () => void }>) {
  const isLeft = dir === 'left';
  const Icon = isLeft ? ChevronLeft : ChevronRight;
  return (
    <div
      className={`absolute ${isLeft ? 'left' : 'right'}-0 top-0 bottom-2 w-16 z-10 flex items-center ${isLeft ? 'justify-start' : 'justify-end'} ${isLeft ? 'bg-gradient-to-r' : 'bg-gradient-to-l'} from-[#121212] to-transparent pointer-events-none`}
    >
      <button
        aria-label={`Scroll ${dir}`}
        onClick={onClick}
        className={`pointer-events-auto ${isLeft ? 'ml-1' : 'mr-1'} w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
      >
        <Icon className="w-5 h-5 text-text-primary" />
      </button>
    </div>
  );
}

export default function ArtistDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: artist, isLoading: artistLoading, isError: artistError, refetch: refetchArtist } = useArtist(id ?? '');
  const { data: albumsData, isLoading: albumsLoading, isError: albumsError, refetch: refetchAlbums } = useArtistAlbums(id ?? '');
  const { play } = usePlaybackControls();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isLoading = artistLoading || albumsLoading;
  const isError = artistError || albumsError;

  const albums = (albumsData?.items ?? []).slice(0, 10);
  const artistImage = artist?.images?.[0]?.url;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateArrows = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    updateArrows();
    el.addEventListener('scroll', updateArrows);
    globalThis.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      globalThis.removeEventListener('resize', updateArrows);
    };
  }, [albums]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -CARD_WIDTH * 2 : CARD_WIDTH * 2, behavior: 'smooth' });
  };

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
            {canScrollLeft && <ScrollArrow dir="left" onClick={() => scroll('left')} />}
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
            {canScrollRight && <ScrollArrow dir="right" onClick={() => scroll('right')} />}
          </div>
        </section>
      </div>
    </div>
  );
}
