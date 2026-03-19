import { useQuery } from "@tanstack/react-query";
import { useSpotifyApi } from "./useSpotifyApi";

function requireApi<T>(api: T | null): T {
  if (api === null) throw new Error("Spotify API not initialized");
  return api;
}

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

export const useFeaturedPlaylists = (limit = 20, offset = 0) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ["spotify", "featured-playlists", limit, offset],
    queryFn: () =>
      requireApi(api).browse.getFeaturedPlaylists({ limit, offset }),
    enabled: api !== null,
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

export const useCurrentUserProfile = () => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ["spotify", "me"],
    queryFn: () => requireApi(api).getCurrentUserProfile(),
    enabled: api !== null,
    staleTime: 10 * 60 * 1000,
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
