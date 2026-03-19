import { useQuery } from '@tanstack/react-query';
import { SpotifyApi } from '../lib/api/index';
import { useAuthToken } from './useAuthToken';

export const useSpotifyApi = (): SpotifyApi => {
  const { accessToken, isAuthenticated, error } = useAuthToken();
  
  if (!isAuthenticated || !accessToken) {
    console.log('❌ No valid access token available');
    console.log('Authentication status:', { isAuthenticated, hasToken: !!accessToken, error });
    throw new Error(`Authentication required: ${error || 'No access token'}`);
  }
  
  console.log('✅ Creating Spotify API client with valid token');
  return new SpotifyApi(accessToken);
};

// Search hooks
export const useSpotifySearch = (
  query: string, 
  types: ('album' | 'artist' | 'playlist' | 'track')[] = ['track', 'artist', 'album', 'playlist'],
  options?: {
    market?: string;
    limit?: number;
    offset?: number;
    enabled?: boolean;
  }
) => {
  const { accessToken, isAuthenticated } = useAuthToken();
  
  return useQuery({
    queryKey: ['spotify', 'search', query, types, options],
    queryFn: () => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.search.search(query, types, options);
    },
    enabled: !!query && !!accessToken && isAuthenticated && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Current user profile
export const useCurrentUserProfile = () => {
  const { accessToken, isAuthenticated } = useAuthToken();
  
  return useQuery({
    queryKey: ['spotify', 'user', 'me'],
    queryFn: () => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.getCurrentUserProfile();
    },
    enabled: !!accessToken && isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Current playback state
export const useCurrentPlayback = () => {
  const { accessToken, isAuthenticated } = useAuthToken();
  
  return useQuery({
    queryKey: ['spotify', 'playback', 'current'],
    queryFn: () => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playback.getCurrentPlayback();
    },
    enabled: !!accessToken && isAuthenticated,
    refetchInterval: 1000, // Refresh every second for real-time updates
    retry: false,
  });
};

// Currently playing track
export const useCurrentlyPlaying = () => {
  const { accessToken, isAuthenticated } = useAuthToken();
  
  return useQuery({
    queryKey: ['spotify', 'playback', 'currently-playing'],
    queryFn: () => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playback.getCurrentlyPlaying();
    },
    enabled: !!accessToken && isAuthenticated,
    refetchInterval: 1000, // Refresh every second
    retry: false,
  });
};

// Available devices
export const useAvailableDevices = () => {
  const { accessToken, isAuthenticated } = useAuthToken();
  
  return useQuery({
    queryKey: ['spotify', 'devices'],
    queryFn: () => {
      if (!accessToken || !isAuthenticated) {
        throw new Error('Authentication required');
      }
      const api = new SpotifyApi(accessToken);
      return api.playback.getAvailableDevices();
    },
    enabled: !!accessToken && isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// User's playlists
export const useUserPlaylists = (limit = 50, offset = 0) => {
  const api = useSpotifyApi();
  
  return useQuery({
    queryKey: ['spotify', 'playlists', 'me', limit, offset],
    queryFn: () => api.playlists.getCurrentUserPlaylists({ limit, offset }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Specific playlist
export const usePlaylist = (playlistId: string, enabled = true) => {
  const api = useSpotifyApi();
  
  return useQuery({
    queryKey: ['spotify', 'playlist', playlistId],
    queryFn: () => api.playlists.getPlaylist(playlistId),
    enabled: !!playlistId && enabled,
    staleTime: 5 * 60 * 1000,
  });
};

// Playlist tracks
export const usePlaylistTracks = (playlistId: string, limit = 50, offset = 0) => {
  const api = useSpotifyApi();
  
  return useQuery({
    queryKey: ['spotify', 'playlist', playlistId, 'tracks', limit, offset],
    queryFn: () => api.playlists.getPlaylistItems(playlistId, { limit, offset }),
    enabled: !!playlistId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Artist details
export const useArtist = (artistId: string, enabled = true) => {
  const api = useSpotifyApi();
  
  return useQuery({
    queryKey: ['spotify', 'artist', artistId],
    queryFn: () => api.artists.getArtist(artistId),
    enabled: !!artistId && enabled,
    staleTime: 10 * 60 * 1000,
  });
};

// Artist's top tracks
export const useArtistTopTracks = (artistId: string, market = 'US') => {
  const api = useSpotifyApi();
  
  return useQuery({
    queryKey: ['spotify', 'artist', artistId, 'top-tracks', market],
    queryFn: () => api.artists.getArtistTopTracks(artistId, market),
    enabled: !!artistId,
    staleTime: 10 * 60 * 1000,
  });
};

// Artist's albums
export const useArtistAlbums = (artistId: string, includeGroups?: string, limit = 20, offset = 0) => {
  const api = useSpotifyApi();
  
  return useQuery({
    queryKey: ['spotify', 'artist', artistId, 'albums', includeGroups, limit, offset],
    queryFn: () => api.artists.getArtistAlbums(artistId, { 
      include_groups: includeGroups as 'album' | 'single' | 'appears_on' | 'compilation',
      limit, 
      offset 
    }),
    enabled: !!artistId,
    staleTime: 10 * 60 * 1000,
  });
};

// Album details
export const useAlbum = (albumId: string, enabled = true) => {
  const api = useSpotifyApi();
  
  return useQuery({
    queryKey: ['spotify', 'album', albumId],
    queryFn: () => api.albums.getAlbum(albumId),
    enabled: !!albumId && enabled,
    staleTime: 10 * 60 * 1000,
  });
};

// Album tracks
export const useAlbumTracks = (albumId: string, limit = 50, offset = 0) => {
  const api = useSpotifyApi();
  
  return useQuery({
    queryKey: ['spotify', 'album', albumId, 'tracks', limit, offset],
    queryFn: () => api.albums.getAlbumTracks(albumId, { limit, offset }),
    enabled: !!albumId,
    staleTime: 10 * 60 * 1000,
  });
};

// User's saved tracks
export const useUserSavedTracks = (limit = 50, offset = 0) => {
  const api = useSpotifyApi();
  
  return useQuery({
    queryKey: ['spotify', 'tracks', 'saved', limit, offset],
    queryFn: () => api.tracks.getUserSavedTracks({ limit, offset }),
    staleTime: 2 * 60 * 1000,
  });
};

// User's saved albums
export const useUserSavedAlbums = (limit = 50, offset = 0) => {
  const api = useSpotifyApi();
  
  return useQuery({
    queryKey: ['spotify', 'albums', 'saved', limit, offset],
    queryFn: () => api.albums.getUserSavedAlbums({ limit, offset }),
    staleTime: 2 * 60 * 1000,
  });
};

// Featured playlists
export const useFeaturedPlaylists = (country?: string, limit = 20, offset = 0) => {
  const api = useSpotifyApi();
  
  return useQuery({
    queryKey: ['spotify', 'browse', 'featured-playlists', country, limit, offset],
    queryFn: () => api.browse.getFeaturedPlaylists({ country, limit, offset }),
    staleTime: 10 * 60 * 1000,
  });
};

// New releases
export const useNewReleases = (country?: string, limit = 20, offset = 0) => {
  const api = useSpotifyApi();
  
  return useQuery({
    queryKey: ['spotify', 'browse', 'new-releases', country, limit, offset],
    queryFn: () => api.browse.getNewReleases({ country, limit, offset }),
    staleTime: 10 * 60 * 1000,
  });
};

// Categories
export const useCategories = (country?: string, limit = 50, offset = 0) => {
  const api = useSpotifyApi();
  
  return useQuery({
    queryKey: ['spotify', 'browse', 'categories', country, limit, offset],
    queryFn: () => api.browse.getCategories({ country, limit, offset }),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};
