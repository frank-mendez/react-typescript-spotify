import type { Track } from '../../../types/spotify';
import { useRecentlyPlayed } from '../../../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../../../hooks/useSpotifyMutations';
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

    if (track.album && !seen.has(`album:${track.album.id}`)) {
      seen.add(`album:${track.album.id}`);
      result.push({
        id: track.album.id,
        name: track.album.name,
        imageUrl: track.album.images[1]?.url ?? track.album.images[0]?.url,
        type: 'album',
        uri: track.album.uri,
        navigationPath: `/album/${track.album.id}`,
        subtitle: 'Album',
      });
    }

    if (result.length >= max) break;

    const artist = track.artists[0];
    if (artist && !seen.has(`artist:${artist.id}`)) {
      seen.add(`artist:${artist.id}`);
      result.push({
        id: artist.id,
        name: artist.name,
        imageUrl: undefined,
        type: 'artist',
        uri: artist.uri,
        navigationPath: `/artist/${artist.id}`,
        subtitle: 'Artist',
      });
    }
  }

  return result;
}

export function RecentlyPlayedSection() {
  const { data, isLoading } = useRecentlyPlayed(20);
  const { play } = usePlaybackControls();

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
    <HomeSection title="Recently Played">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {items.map((item) => (
          <RecentlyPlayedCard
            key={item.id}
            item={item}
            onPlay={(uri) => play.mutate({ context_uri: uri })}
          />
        ))}
      </div>
    </HomeSection>
  );
}
