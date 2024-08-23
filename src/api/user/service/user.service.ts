import { ProfileInterface } from "../../../data-objects/interface";

export async function getUserData(token: string): Promise<ProfileInterface> {
  const response = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  return await response.json();
}
