import { useFeaturedPlaylists, useCurrentPlayback } from '../../../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../../../hooks/useSpotifyMutations';
import { usePlayerStore } from '../../../stores/usePlayerStore';
import { PlaylistCarousel } from './PlaylistCarousel';

export function FeaturedPlaylistSection() {
  const { data, isLoading, isError } = useFeaturedPlaylists(20);
  const { data: playback } = useCurrentPlayback();
  const { play, pause } = usePlaybackControls();
  const { deviceId } = usePlayerStore();

  if (isError) return null;

  const playlists = (data?.playlists?.items ?? []).filter((item) => item !== null);

  return (
    <PlaylistCarousel
      title="Featured Playlists"
      playlists={playlists}
      isLoading={isLoading}
      activeContextUri={playback?.context?.uri ?? null}
      isPlaybackActive={playback?.is_playing ?? false}
      onPlay={(uri) => play.mutate({ context_uri: uri, device_id: deviceId ?? undefined })}
      onPause={() => pause.mutate(deviceId ?? undefined)}
    />
  );
}
