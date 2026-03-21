import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFeaturedPlaylists, useCurrentPlayback } from '../../../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../../../hooks/useSpotifyMutations';
import { usePlayerStore } from '../../../stores/usePlayerStore';
import { HomeSection } from './HomeSection';
import { Skeleton } from '../../ui/skeleton';
import { PlaylistCard } from './PlaylistCard';

const CARD_WIDTH = 168;

export function FeaturedPlaylistSection() {
  const { data, isLoading, isError } = useFeaturedPlaylists(20);
  const { data: playback } = useCurrentPlayback();
  const { play, pause } = usePlaybackControls();
  const { deviceId } = usePlayerStore();

  const activeContextUri = playback?.context?.uri ?? null;
  const isPlaybackActive = playback?.is_playing ?? false;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [data]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -CARD_WIDTH * 2 : CARD_WIDTH * 2, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <HomeSection title="Featured Playlists">
        <div className="flex gap-4">
          {['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'].map((k) => (
            <div key={k} className="flex flex-col gap-2 w-40 shrink-0">
              <Skeleton className="w-40 h-40 rounded-md" />
              <Skeleton className="h-3 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </HomeSection>
    );
  }

  const playlists = (data?.playlists?.items ?? []).filter((item) => item !== null);
  if (isError || !playlists.length) return null;

  return (
    <HomeSection title="Featured Playlists">
      <div className="relative overflow-hidden">
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-2 w-16 z-10 flex items-center justify-start bg-gradient-to-r from-surface to-transparent pointer-events-none">
            <button
              aria-label="Scroll left"
              onClick={() => scroll('left')}
              className="pointer-events-auto ml-1 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft className="w-5 h-5 text-text-primary" />
            </button>
          </div>
        )}

        <div
          ref={scrollRef}
          data-testid="scroll-container"
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onPlay={(uri) => play.mutate({ context_uri: uri, device_id: deviceId ?? undefined })}
              onPause={() => pause.mutate(deviceId ?? undefined)}
              isActive={activeContextUri === playlist.uri}
              isPlaying={activeContextUri === playlist.uri && isPlaybackActive}
            />
          ))}
        </div>

        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-2 w-16 z-10 flex items-center justify-end bg-gradient-to-l from-surface to-transparent pointer-events-none">
            <button
              aria-label="Scroll right"
              onClick={() => scroll('right')}
              className="pointer-events-auto mr-1 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight className="w-5 h-5 text-text-primary" />
            </button>
          </div>
        )}
      </div>
    </HomeSection>
  );
}
