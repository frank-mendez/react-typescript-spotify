import { useQuery } from "@tanstack/react-query";
import profileQueryKey from "./user-query-keys.ts";
import { getUserData } from "../service/user.service.ts";

export const useProfileQuery = (token: string) => {
  return useQuery({
    queryKey: profileQueryKey.profile,
    queryFn: () => getUserData(token),
  });
};
