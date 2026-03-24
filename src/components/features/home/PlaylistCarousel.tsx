import { useRef, useState, useEffect } from 'react';
import type { Playlist } from '../../../types/spotify';
import { HomeSection } from './HomeSection';
import { Skeleton } from '../../ui/skeleton';
import { PlaylistCard } from './PlaylistCard';
import { ScrollArrow } from '../../ui/ScrollArrow';

const CARD_WIDTH = 168;
const SKELETON_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];

interface PlaylistCarouselProps {
  title: string;
  playlists: Playlist[];
  isLoading: boolean;
  activeContextUri: string | null;
  isPlaybackActive: boolean;
  onPlay: (uri: string) => void;
  onPause: () => void;
}

export function PlaylistCarousel({
  title,
  playlists,
  isLoading,
  activeContextUri,
  isPlaybackActive,
  onPlay,
  onPause,
}: Readonly<PlaylistCarouselProps>) {
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
    globalThis.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      globalThis.removeEventListener('resize', updateArrows);
    };
  }, [playlists]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -CARD_WIDTH * 2 : CARD_WIDTH * 2, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <HomeSection title={title}>
        <div className="flex gap-4">
          {SKELETON_KEYS.map((key) => (
            <div key={key} className="flex flex-col gap-2 w-40 shrink-0">
              <Skeleton className="w-40 h-40 rounded-md" />
              <Skeleton className="h-3 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </HomeSection>
    );
  }

  if (!playlists.length) return null;

  return (
    <HomeSection title={title}>
      <div className="relative overflow-hidden">
        {canScrollLeft && <ScrollArrow dir="left" onClick={() => scroll('left')} />}
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
              onPlay={onPlay}
              onPause={onPause}
              isActive={activeContextUri === playlist.uri}
              isPlaying={activeContextUri === playlist.uri && isPlaybackActive}
            />
          ))}
        </div>
        {canScrollRight && <ScrollArrow dir="right" onClick={() => scroll('right')} />}
      </div>
    </HomeSection>
  );
}
