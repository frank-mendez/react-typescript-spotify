import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useUserPlaylists, useCurrentUserProfile, useCurrentPlayback } from '../../../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../../../hooks/useSpotifyMutations';
import { usePlayerStore } from '../../../stores/usePlayerStore';
import { HomeSection } from './HomeSection';
import { Skeleton } from '../../ui/skeleton';
import type { Playlist } from '../../../types/spotify';

const CARD_WIDTH = 168;

interface PlaylistCardProps {
  playlist: Playlist;
  onPlay: (uri: string) => void;
  onPause: () => void;
  isActive: boolean;
  isPlaying: boolean;
}

function PlaylistCard({ playlist, onPlay, onPause, isActive, isPlaying }: Readonly<PlaylistCardProps>) {
  const navigate = useNavigate();
  const image = playlist.images?.[0]?.url;
  const initials = playlist.name.slice(0, 2).toUpperCase();

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive && isPlaying) {
      onPause();
    } else {
      onPlay(playlist.uri);
    }
  };

  return (
    <button
      className="flex flex-col gap-2 w-40 shrink-0 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-md"
      onClick={() => navigate(`/playlist/${playlist.id}`)}
    >
      <div className="relative w-40 h-40 rounded-md overflow-hidden bg-surface-hover">
        {image ? (
          <img
            src={image}
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-accent/20 text-accent font-bold text-2xl">
            {initials}
          </div>
        )}

        {/* Play/Pause button — bottom right corner */}
        <div
          className={`absolute bottom-2 right-2 transition-all duration-200 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}`}
          onClick={handlePlayPause}
        >
          <span className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
            {isActive && isPlaying ? (
              <>
                <span className="group-hover:hidden flex items-end gap-[2px] h-4">
                  <span className="w-[3px] bg-black rounded-sm animate-eq-bar1" />
                  <span className="w-[3px] bg-black rounded-sm animate-eq-bar2" />
                  <span className="w-[3px] bg-black rounded-sm animate-eq-bar3" />
                </span>
                <Pause className="hidden group-hover:flex w-4 h-4 text-black fill-black" />
              </>
            ) : (
              <Play className="w-4 h-4 text-black fill-black ml-0.5" />
            )}
          </span>
        </div>
      </div>

      <div className="px-0.5">
        <p className="text-text-primary text-sm font-semibold truncate">{playlist.name}</p>
        {playlist.description && (
          <p className="text-text-muted text-xs truncate mt-0.5">{playlist.description}</p>
        )}
      </div>
    </button>
  );
}

export function MadeForYouSection() {
  const { data, isLoading } = useUserPlaylists(50);
  const { data: profile } = useCurrentUserProfile();
  const { data: playback } = useCurrentPlayback();
  const { play, pause } = usePlaybackControls();
  const { deviceId } = usePlayerStore();

  const sectionTitle = `Made For ${profile?.display_name ?? 'You'}`;
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
      <HomeSection title={sectionTitle}>
        <div className="flex gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
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

  const playlists = data?.items ?? [];
  if (!playlists.length) return null;

  return (
    <HomeSection title={sectionTitle}>
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
