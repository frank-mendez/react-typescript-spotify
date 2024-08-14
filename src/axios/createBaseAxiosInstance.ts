import axios, { CreateAxiosDefaults } from "axios";

export const createBaseAxiosInstance = (
  configOverrides: CreateAxiosDefaults = {},
) => {
  const baseURL = import.meta.env.VITE_TMDB_API_URL;
  return axios.create({
    baseURL,
    ...configOverrides,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
};
