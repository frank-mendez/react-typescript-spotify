import type { Track } from '../../../types/spotify';
import { useRecentlyPlayed, useCurrentPlayback } from '../../../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../../../hooks/useSpotifyMutations';
import { usePlayerStore } from '../../../stores/usePlayerStore';
import { Skeleton } from '../../ui/skeleton';
import { HomeSection } from './HomeSection';
import { RecentlyPlayedCard } from './RecentlyPlayedCard';
import type { RecentItem } from './RecentlyPlayedCard';

function deriveItems(
  items: Array<{ track: Track }>,
  max = 8
): RecentItem[] {
  const seen = new Set<string>();
  const result: RecentItem[] = [];

  for (const { track } of items) {
    if (result.length >= max) break;

    if (!seen.has(track.id)) {
      seen.add(track.id);
      result.push({
        id: track.id,
        name: track.name,
        imageUrl: track.album?.images[1]?.url ?? track.album?.images[0]?.url,
        type: 'track',
        uri: track.uri,
        navigationPath: `/album/${track.album?.id}`,
        subtitle: track.artists.map((a) => a.name).join(', '),
      });
    }
  }

  return result;
}

export function RecentlyPlayedSection() {
  const { data, isLoading } = useRecentlyPlayed(20);
  const { play, pause } = usePlaybackControls();
  const { deviceId } = usePlayerStore();
  const { data: playback } = useCurrentPlayback();

  const activeTrackUri = playback?.item?.uri ?? null;
  const isPlaybackActive = playback?.is_playing ?? false;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data?.items?.length) return null;

  const items = deriveItems(data.items);
  if (!items.length) return null;

  return (
    <HomeSection>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {items.map((item) => (
          <RecentlyPlayedCard
            key={`${item.type}:${item.id}`}
            item={item}
            onPlay={(uri) => play.mutate({ uris: [uri], device_id: deviceId ?? undefined })}
            onPause={() => pause.mutate(deviceId ?? undefined)}
            isActive={activeTrackUri === item.uri}
            isPlaying={activeTrackUri === item.uri && isPlaybackActive}
          />
        ))}
      </div>
    </HomeSection>
  );
}
