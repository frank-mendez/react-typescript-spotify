import { useParams } from 'react-router-dom';
import { usePlaylist } from '../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../hooks/useSpotifyMutations';
import { ErrorState } from '../components/ui/ErrorState';
import { PlaylistDetailSkeleton } from '../components/features/playlist/PlaylistDetailSkeleton';
import { PlaylistHeader } from '../components/features/playlist/PlaylistHeader';
import { PlaylistTrackList } from '../components/features/playlist/PlaylistTrackList';

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: playlist, isLoading, isError, refetch } = usePlaylist(id ?? '');
  const { play } = usePlaybackControls();

  if (isLoading) return <PlaylistDetailSkeleton />;
  if (isError || !playlist) {
    return <ErrorState message="Failed to load playlist." onRetry={() => refetch()} />;
  }

  const playlistItems = playlist.items?.items ?? [];

  return (
    <div className="flex flex-col min-h-full" data-testid="playlist-detail">
      <PlaylistHeader
        playlist={playlist}
        onPlay={() => play.mutate({ context_uri: playlist.uri })}
      />
      <div className="flex-1 bg-[#121212] px-6 py-4">
        <PlaylistTrackList items={playlistItems} playlistUri={playlist.uri} />
      </div>
    </div>
  );
}
