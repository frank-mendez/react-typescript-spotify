import { useQuery } from "@tanstack/react-query";
import profileQueryKey from "./user-query-keys";
import { getUserData } from "../lib/api/user.service";

export const useProfileQuery = (token: string) => {
  return useQuery({
    queryKey: profileQueryKey.profile,
    queryFn: () => getUserData(token),
  });
};
