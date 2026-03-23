import { usePlaybackControls } from '../../../hooks/useSpotifyMutations';
import { TrackRow } from '../TrackRow';
import type { PlaylistItem, Track } from '../../../types/spotify';

interface PlaylistTrackListProps {
  items: PlaylistItem[];
  playlistUri: string;
}

export function PlaylistTrackList({ items, playlistUri }: Readonly<PlaylistTrackListProps>) {
  const { play } = usePlaybackControls();

  const tracks = items.filter(
    (i): i is PlaylistItem & { item: Track } => i.item?.type === 'track'
  );

  if (tracks.length === 0) {
    return (
      <p className="text-text-muted text-sm text-center py-12">No tracks available.</p>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-10 bg-[#121212] px-2 py-2 border-b border-border mb-2">
        <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">Title</span>
      </div>
      {tracks.map((playlistItem) => (
        <TrackRow
          key={playlistItem.item.id}
          track={playlistItem.item}
          onPlay={(uri) => play.mutate({ context_uri: playlistUri, offset: { uri } })}
        />
      ))}
    </div>
  );
}
