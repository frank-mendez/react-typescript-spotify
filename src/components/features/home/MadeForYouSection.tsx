import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMadeForYouPlaylists, useCurrentPlayback } from '../../../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../../../hooks/useSpotifyMutations';
import { usePlayerStore } from '../../../stores/usePlayerStore';
import { HomeSection } from './HomeSection';
import { Skeleton } from '../../ui/skeleton';
import { PlaylistCard } from './PlaylistCard';

const CARD_WIDTH = 168;
const SKELETON_COUNT = 8;

function ScrollArrow({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) {
  const isLeft = dir === 'left';
  const Icon = isLeft ? ChevronLeft : ChevronRight;
  return (
    <div
      className={`absolute ${isLeft ? 'left' : 'right'}-0 top-0 bottom-2 w-16 z-10 flex items-center ${isLeft ? 'justify-start' : 'justify-end'} ${isLeft ? 'bg-gradient-to-r' : 'bg-gradient-to-l'} from-surface to-transparent pointer-events-none`}
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

export function MadeForYouSection() {
  const { data, isLoading, isError } = useMadeForYouPlaylists(20);
  const { data: playback } = useCurrentPlayback();
  const { play, pause } = usePlaybackControls();
  const { deviceId } = usePlayerStore();

  const activeContextUri = playback?.context?.uri ?? null;
  const isPlaybackActive = playback?.is_playing ?? false;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateArrows = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    updateArrows();
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
      <HomeSection title="Made For You">
        <div className="flex gap-4">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 w-40 shrink-0">
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
    <HomeSection title="Made For You">
      <div className="relative overflow-hidden">
        {canScrollLeft && <ScrollArrow dir="left" onClick={() => scroll('left')} />}

        <div
          ref={scrollRef}
          data-testid="scroll-container"
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {playlists.map((playlist) => {
            const isActive = activeContextUri === playlist.uri;
            return (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onPlay={(uri) => play.mutate({ context_uri: uri, device_id: deviceId ?? undefined })}
                onPause={() => pause.mutate(deviceId ?? undefined)}
                isActive={isActive}
                isPlaying={isActive && isPlaybackActive}
              />
            );
          })}
        </div>

        {canScrollRight && <ScrollArrow dir="right" onClick={() => scroll('right')} />}
      </div>
    </HomeSection>
  );
}
