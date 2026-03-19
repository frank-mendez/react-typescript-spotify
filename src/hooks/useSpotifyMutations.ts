import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSpotifyApi } from './useSpotifyApi';

export const usePlaybackControls = () => {
  const api = useSpotifyApi();
  const queryClient = useQueryClient();

  const invalidatePlayback = () => {
    queryClient.invalidateQueries({ queryKey: ['spotify', 'playback'] });
  };

  const play = useMutation({
    mutationFn: (options?: {
      device_id?: string;
      context_uri?: string;
      uris?: string[];
      offset?: { position?: number; uri?: string };
      position_ms?: number;
    }) => {
      if (!api) throw new Error('Not authenticated');
      return api.playback.startResumePlayback(options);
    },
    onSuccess: invalidatePlayback,
  });

  const pause = useMutation({
    mutationFn: (deviceId?: string) => {
      if (!api) throw new Error('Not authenticated');
      return api.playback.pausePlayback(deviceId);
    },
    onSuccess: invalidatePlayback,
  });

  const next = useMutation({
    mutationFn: (deviceId?: string) => {
      if (!api) throw new Error('Not authenticated');
      return api.playback.skipToNext(deviceId);
    },
    onSuccess: invalidatePlayback,
  });

  const previous = useMutation({
    mutationFn: (deviceId?: string) => {
      if (!api) throw new Error('Not authenticated');
      return api.playback.skipToPrevious(deviceId);
    },
    onSuccess: invalidatePlayback,
  });

  const seek = useMutation({
    mutationFn: ({ positionMs, deviceId }: { positionMs: number; deviceId?: string }) => {
      if (!api) throw new Error('Not authenticated');
      return api.playback.seekToPosition(positionMs, deviceId);
    },
    onSuccess: invalidatePlayback,
  });

  const setVolume = useMutation({
    mutationFn: ({ volumePercent, deviceId }: { volumePercent: number; deviceId?: string }) => {
      if (!api) throw new Error('Not authenticated');
      return api.playback.setPlaybackVolume(volumePercent, deviceId);
    },
    onSuccess: invalidatePlayback,
  });

  const setRepeat = useMutation({
    mutationFn: ({ state, deviceId }: { state: 'track' | 'context' | 'off'; deviceId?: string }) => {
      if (!api) throw new Error('Not authenticated');
      return api.playback.setRepeatMode(state, deviceId);
    },
    onSuccess: invalidatePlayback,
  });

  const setShuffle = useMutation({
    mutationFn: ({ state, deviceId }: { state: boolean; deviceId?: string }) => {
      if (!api) throw new Error('Not authenticated');
      return api.playback.toggleShuffle(state, deviceId);
    },
    onSuccess: invalidatePlayback,
  });

  const transferPlayback = useMutation({
    mutationFn: ({ deviceIds, play: autoPlay }: { deviceIds: string[]; play?: boolean }) => {
      if (!api) throw new Error('Not authenticated');
      return api.playback.transferPlayback(deviceIds, autoPlay);
    },
    onSuccess: () => {
      invalidatePlayback();
      queryClient.invalidateQueries({ queryKey: ['spotify', 'devices'] });
    },
  });

  return { play, pause, next, previous, seek, setVolume, setRepeat, setShuffle, transferPlayback };
};

export const useLibraryControls = () => {
  const api = useSpotifyApi();
  const queryClient = useQueryClient();

  const invalidateLibrary = () => {
    queryClient.invalidateQueries({ queryKey: ['spotify', 'me'] });
  };

  const saveTrack = useMutation({
    mutationFn: (trackId: string) => {
      if (!api) throw new Error('Not authenticated');
      return api.tracks.saveTracks([trackId]);
    },
    onSuccess: invalidateLibrary,
  });

  const removeTrack = useMutation({
    mutationFn: (trackId: string) => {
      if (!api) throw new Error('Not authenticated');
      return api.tracks.removeTracks([trackId]);
    },
    onSuccess: invalidateLibrary,
  });

  const saveAlbum = useMutation({
    mutationFn: (albumId: string) => {
      if (!api) throw new Error('Not authenticated');
      return api.albums.saveAlbums([albumId]);
    },
    onSuccess: invalidateLibrary,
  });

  const removeAlbum = useMutation({
    mutationFn: (albumId: string) => {
      if (!api) throw new Error('Not authenticated');
      return api.albums.removeAlbums([albumId]);
    },
    onSuccess: invalidateLibrary,
  });

  return { saveTrack, removeTrack, saveAlbum, removeAlbum };
};

export const usePlaylistControls = () => {
  const api = useSpotifyApi();
  const queryClient = useQueryClient();

  const invalidatePlaylists = () => {
    queryClient.invalidateQueries({ queryKey: ['spotify', 'playlists'] });
  };

  const addToPlaylist = useMutation({
    mutationFn: ({ playlistId, uris }: { playlistId: string; uris: string[] }) => {
      if (!api) throw new Error('Not authenticated');
      return api.playlists.addItemsToPlaylist(playlistId, { uris });
    },
    onSuccess: invalidatePlaylists,
  });

  const removeFromPlaylist = useMutation({
    mutationFn: ({ playlistId, tracks }: { playlistId: string; tracks: Array<{ uri: string }> }) => {
      if (!api) throw new Error('Not authenticated');
      return api.playlists.removeItemsFromPlaylist(playlistId, tracks);
    },
    onSuccess: invalidatePlaylists,
  });

  return { addToPlaylist, removeFromPlaylist };
};
