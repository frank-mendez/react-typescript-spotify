import { useQuery } from '@tanstack/react-query';
import { useSpotifyApi } from './useSpotifyApi';

export const useProfileQuery = () => {
  const api = useSpotifyApi();

  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => api!.getCurrentUserProfile(),
    enabled: api !== null,
    staleTime: 10 * 60 * 1000,
  });
};
