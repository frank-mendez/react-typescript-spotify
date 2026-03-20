import { useParams } from 'react-router-dom';
import { usePlaylist } from '../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../hooks/useSpotifyMutations';
import { ErrorState } from '../components/ui/ErrorState';
import { PlaylistDetailSkeleton } from '../components/features/playlist/PlaylistDetailSkeleton';
import { PlaylistHeader } from '../components/features/playlist/PlaylistHeader';

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: playlist, isLoading, isError, refetch } = usePlaylist(id ?? '');
  const { play } = usePlaybackControls();

  if (isLoading) return <PlaylistDetailSkeleton />;
  if (isError || !playlist) {
    return <ErrorState message="Failed to load playlist." onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col min-h-full" data-testid="playlist-detail">
      <PlaylistHeader
        playlist={playlist}
        onPlay={() => play.mutate({ context_uri: playlist.uri })}
      />
    </div>
  );
}
