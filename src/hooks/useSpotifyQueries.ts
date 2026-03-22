import { useQuery } from "@tanstack/react-query";
import { useSpotifyApi } from "./useSpotifyApi";

function requireApi<T>(api: T | null): T {
  if (api === null) throw new Error("Spotify API not initialized");
  return api;
}

export const useCurrentUserProfile = () => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ["spotify", "me"],
    queryFn: () => requireApi(api).getCurrentUserProfile(),
    enabled: api !== null,
    staleTime: 10 * 60 * 1000,
  });
};

export const useUserPlaylists = (limit = 50, offset = 0) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ["spotify", "playlists", "me", limit, offset],
    queryFn: () =>
      requireApi(api).playlists.getCurrentUserPlaylists({ limit, offset }),
    enabled: api !== null,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeaturedPlaylists = (limit = 20) => {
  const api = useSpotifyApi();
  const { data: profile, isLoading: profileLoading } = useCurrentUserProfile();
  const market = profile?.country;
  const query = useQuery({
    queryKey: ['spotify', 'playlists', 'featured', limit, market],
    queryFn: () =>
      requireApi(api).search.search('featured', ['playlist'], { market }),
    enabled: api !== null && profile !== undefined,
    staleTime: 10 * 60 * 1000,
  });
  return { ...query, isLoading: query.isLoading || profileLoading };
};

export const useMadeForYouPlaylists = (limit = 20) => {
  const api = useSpotifyApi();
  const { data: profile, isLoading: profileLoading } = useCurrentUserProfile();
  const market = profile?.country;
  const query = useQuery({
    queryKey: ['spotify', 'playlists', 'made-for-you', limit, market],
    queryFn: () =>
      requireApi(api).search.search('for me', ['playlist'], { market }),
    enabled: api !== null && profile !== undefined,
    staleTime: 10 * 60 * 1000,
  });
  return { ...query, isLoading: query.isLoading || profileLoading };
};

export const useCategories = (limit = 50) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ["spotify", "categories", limit],
    queryFn: () => requireApi(api).browse.getCategories({ limit }),
    enabled: api !== null,
    staleTime: 60 * 60 * 1000,
  });
};

export const useCategoryPlaylists = (categoryId: string | undefined, limit = 20) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ["spotify", "category-playlists", categoryId, limit],
    queryFn: () =>
      requireApi(api).browse.getCategoryPlaylists(categoryId!, { limit }),
    enabled: api !== null && !!categoryId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useNewReleases = (limit = 20, offset = 0) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ["spotify", "new-releases", limit, offset],
    queryFn: () => requireApi(api).browse.getNewReleases({ limit, offset }),
    enabled: api !== null,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCurrentPlayback = () => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ["spotify", "playback", "current"],
    queryFn: () => requireApi(api).playback.getCurrentPlayback(),
    enabled: api !== null,
    refetchInterval: (query) => {
      return (query.state.data as { is_playing?: boolean } | null)?.is_playing
        ? 1000
        : 5000;
    },
    staleTime: 0,
  });
};

export const useCurrentlyPlaying = () => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ["spotify", "playback", "currently-playing"],
    queryFn: () => requireApi(api).playback.getCurrentlyPlaying(),
    enabled: api !== null,
    refetchInterval: (query) => {
      return (query.state.data as { is_playing?: boolean } | null)?.is_playing
        ? 1000
        : 5000;
    },
    staleTime: 0,
  });
};

export const useAvailableDevices = () => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ["spotify", "devices"],
    queryFn: () => requireApi(api).playback.getAvailableDevices(),
    enabled: api !== null,
    staleTime: 30 * 1000,
  });
};

export const useSearchQuery = (
  query: string,
  types: ("track" | "artist" | "album" | "playlist" | "show" | "episode")[] = [
    "track",
    "artist",
    "album",
  ],
  limit = 10,
) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ["spotify", "search", query, types, limit],
    queryFn: () => requireApi(api).search.search(query, types, { limit }),
    enabled: api !== null && query.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};

export const useArtist = (artistId: string) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ["spotify", "artist", artistId],
    queryFn: () => requireApi(api).artists.getArtist(artistId),
    enabled: api !== null && !!artistId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useAlbum = (albumId: string) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ["spotify", "album", albumId],
    queryFn: () => requireApi(api).albums.getAlbum(albumId),
    enabled: api !== null && !!albumId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useTrack = (trackId: string) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ["spotify", "track", trackId],
    queryFn: () => requireApi(api).tracks.getTrack(trackId),
    enabled: api !== null && !!trackId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useSavedTracks = (limit = 50, offset = 0) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ["spotify", "me", "tracks", limit, offset],
    queryFn: () => requireApi(api).tracks.getUserSavedTracks({ limit, offset }),
    enabled: api !== null,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSavedAlbums = (limit = 50, offset = 0) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ["spotify", "me", "albums", limit, offset],
    queryFn: () => requireApi(api).albums.getUserSavedAlbums({ limit, offset }),
    enabled: api !== null,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePlaylist = (playlistId: string) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ["spotify", "playlist", playlistId],
    queryFn: () => requireApi(api).playlists.getPlaylist(playlistId),
    enabled: api !== null && !!playlistId,
    staleTime: 10 * 60 * 1000,
  });
};


export const useAlbumTracks = (albumId: string, limit = 50, offset = 0) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ["spotify", "album", albumId, "tracks", limit, offset],
    queryFn: () => requireApi(api).albums.getAlbumTracks(albumId, { limit, offset }),
    enabled: api !== null && !!albumId,
    staleTime: 10 * 60 * 1000,
  });
};


export const useFollowedArtists = (limit = 50) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ["spotify", "me", "following", "artists", limit],
    queryFn: () => requireApi(api).artists.getFollowedArtists({ limit }),
    enabled: api !== null,
    staleTime: 5 * 60 * 1000,
  });
};

export const useArtistAlbums = (artistId: string, limit = 10, offset = 0) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ["spotify", "artist", artistId, "albums", limit, offset],
    queryFn: () => requireApi(api).artists.getArtistAlbums(artistId, {
      include_groups: 'album,single,compilation',
      limit,
      ...(offset > 0 && { offset }),
    }),
    enabled: api !== null && !!artistId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useRecentlyPlayed = (limit = 20) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ['spotify', 'recently-played', limit],
    queryFn: () => requireApi(api).playback.getRecentlyPlayedTracks({ limit }),
    enabled: api !== null,
    staleTime: 2 * 60 * 1000,
  });
};
