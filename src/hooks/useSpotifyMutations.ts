import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthToken } from './useAuthToken';
import { SpotifyApi } from '../lib/api/index';

// Playback control mutations
export const usePlaybackControls = () => {
  const { accessToken, isAuthenticated } = useAuthToken();
  const queryClient = useQueryClient();

  const invalidatePlaybackQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['spotify', 'playback'] });
  };

  const play = useMutation({
    mutationFn: async (options?: {
      device_id?: string;
      context_uri?: string;
      uris?: string[];
      offset?: { position?: number; uri?: string };
      position_ms?: number;
    }) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playback.startResumePlayback(options);
    },
    onSuccess: invalidatePlaybackQueries,
  });

  const pause = useMutation({
    mutationFn: async (deviceId?: string) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playback.pausePlayback(deviceId);
    },
    onSuccess: invalidatePlaybackQueries,
  });

  const next = useMutation({
    mutationFn: async (deviceId?: string) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playback.skipToNext(deviceId);
    },
    onSuccess: invalidatePlaybackQueries,
  });

  const previous = useMutation({
    mutationFn: async (deviceId?: string) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playback.skipToPrevious(deviceId);
    },
    onSuccess: invalidatePlaybackQueries,
  });

  const seek = useMutation({
    mutationFn: async ({ positionMs, deviceId }: { positionMs: number; deviceId?: string }) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playback.seekToPosition(positionMs, deviceId);
    },
    onSuccess: invalidatePlaybackQueries,
  });

  const setVolume = useMutation({
    mutationFn: async ({ volumePercent, deviceId }: { volumePercent: number; deviceId?: string }) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playback.setPlaybackVolume(volumePercent, deviceId);
    },
    onSuccess: invalidatePlaybackQueries,
  });

  const setRepeat = useMutation({
    mutationFn: async ({ state, deviceId }: { state: 'track' | 'context' | 'off'; deviceId?: string }) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playback.setRepeatMode(state, deviceId);
    },
    onSuccess: invalidatePlaybackQueries,
  });

  const setShuffle = useMutation({
    mutationFn: async ({ state, deviceId }: { state: boolean; deviceId?: string }) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playback.toggleShuffle(state, deviceId);
    },
    onSuccess: invalidatePlaybackQueries,
  });

  const transferPlayback = useMutation({
    mutationFn: async ({ deviceIds, play }: { deviceIds: string[]; play?: boolean }) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playback.transferPlayback(deviceIds, play);
    },
    onSuccess: () => {
      invalidatePlaybackQueries();
      queryClient.invalidateQueries({ queryKey: ['spotify', 'devices'] });
    },
  });

  const addToQueue = useMutation({
    mutationFn: async ({ uri, deviceId }: { uri: string; deviceId?: string }) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playback.addItemToPlaybackQueue(uri, deviceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'queue'] });
    },
  });

  return {
    play,
    pause,
    next,
    previous,
    seek,
    setVolume,
    setRepeat,
    setShuffle,
    transferPlayback,
    addToQueue,
  };
};

// Library management mutations
export const useLibraryControls = () => {
  const { accessToken, isAuthenticated } = useAuthToken();
  const queryClient = useQueryClient();

  const saveTrack = useMutation({
    mutationFn: async (trackId: string) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.tracks.saveTracks([trackId]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'tracks', 'saved'] });
      queryClient.invalidateQueries({ queryKey: ['spotify', 'tracks', 'contains'] });
    },
  });

  const removeSavedTrack = useMutation({
    mutationFn: async (trackId: string) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.tracks.removeTracks([trackId]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'tracks', 'saved'] });
      queryClient.invalidateQueries({ queryKey: ['spotify', 'tracks', 'contains'] });
    },
  });

  const saveAlbum = useMutation({
    mutationFn: async (albumId: string) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.albums.saveAlbums([albumId]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'albums', 'saved'] });
      queryClient.invalidateQueries({ queryKey: ['spotify', 'albums', 'contains'] });
    },
  });

  const removeSavedAlbum = useMutation({
    mutationFn: async (albumId: string) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.albums.removeAlbums([albumId]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'albums', 'saved'] });
      queryClient.invalidateQueries({ queryKey: ['spotify', 'albums', 'contains'] });
    },
  });

  const followArtist = useMutation({
    mutationFn: async (artistId: string) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.artists.followArtists([artistId]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'following'] });
      queryClient.invalidateQueries({ queryKey: ['spotify', 'artists', 'contains'] });
    },
  });

  const unfollowArtist = useMutation({
    mutationFn: async (artistId: string) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.artists.unfollowArtists([artistId]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'following'] });
      queryClient.invalidateQueries({ queryKey: ['spotify', 'artists', 'contains'] });
    },
  });

  const followPlaylist = useMutation({
    mutationFn: async ({ playlistId, publicFollow }: { playlistId: string; publicFollow?: boolean }) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playlists.followPlaylist(playlistId, publicFollow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'playlists'] });
    },
  });

  const unfollowPlaylist = useMutation({
    mutationFn: async (playlistId: string) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playlists.unfollowPlaylist(playlistId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'playlists'] });
    },
  });

  return {
    saveTrack,
    removeSavedTrack,
    saveAlbum,
    removeSavedAlbum,
    followArtist,
    unfollowArtist,
    followPlaylist,
    unfollowPlaylist,
  };
};

// Playlist management mutations
export const usePlaylistControls = () => {
  const { accessToken, isAuthenticated } = useAuthToken();
  const queryClient = useQueryClient();

  const createPlaylist = useMutation({
    mutationFn: async ({ 
      userId, 
      name, 
      description, 
      publicPlaylist, 
      collaborative 
    }: { 
      userId: string; 
      name: string; 
      description?: string; 
      publicPlaylist?: boolean; 
      collaborative?: boolean; 
    }) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playlists.createPlaylist(userId, {
        name,
        description,
        public: publicPlaylist,
        collaborative,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'playlists'] });
    },
  });

  const updatePlaylist = useMutation({
    mutationFn: async ({ 
      playlistId, 
      name, 
      description, 
      publicPlaylist, 
      collaborative 
    }: { 
      playlistId: string; 
      name?: string; 
      description?: string; 
      publicPlaylist?: boolean; 
      collaborative?: boolean; 
    }) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playlists.updatePlaylistDetails(playlistId, {
        name,
        description,
        public: publicPlaylist,
        collaborative,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'playlist', variables.playlistId] });
      queryClient.invalidateQueries({ queryKey: ['spotify', 'playlists'] });
    },
  });

  const addTracksToPlaylist = useMutation({
    mutationFn: async ({ playlistId, uris, position }: { playlistId: string; uris: string[]; position?: number }) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playlists.addItemsToPlaylist(playlistId, { uris, position });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'playlist', variables.playlistId] });
    },
  });

  const removeTracksFromPlaylist = useMutation({
    mutationFn: async ({ playlistId, tracks }: { playlistId: string; tracks: { uri: string; positions?: number[] }[] }) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playlists.removeItemsFromPlaylist(playlistId, tracks);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'playlist', variables.playlistId] });
    },
  });

  const replacePlaylistTracks = useMutation({
    mutationFn: async ({ playlistId, uris }: { playlistId: string; uris: string[] }) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playlists.replacePlaylistItems(playlistId, uris);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'playlist', variables.playlistId] });
    },
  });

  const reorderPlaylistTracks = useMutation({
    mutationFn: async ({ 
      playlistId, 
      rangeStart, 
      insertBefore, 
      rangeLength, 
      snapshotId 
    }: { 
      playlistId: string; 
      rangeStart: number; 
      insertBefore: number; 
      rangeLength?: number; 
      snapshotId?: string; 
    }) => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playlists.reorderPlaylistItems(playlistId, {
        range_start: rangeStart,
        insert_before: insertBefore,
        range_length: rangeLength,
        snapshot_id: snapshotId,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'playlist', variables.playlistId] });
    },
  });

  return {
    createPlaylist,
    updatePlaylist,
    addTracksToPlaylist,
    removeTracksFromPlaylist,
    replacePlaylistTracks,
    reorderPlaylistTracks,
  };
};
