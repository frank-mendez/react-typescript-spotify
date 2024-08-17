import { useEffect } from "react";
import {
  getToken,
  redirectToSpotifyAuthorize,
} from "../api/auth/service/auth.service.ts";
import { AuthContext } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");
  const args = new URLSearchParams(window.location.search);
  const code = args.get("code");

  useEffect(() => {
    const fetchToken = async () => {
      if (code) {
        const token = await getToken(code);

        localStorage.setItem("access_token", token.access_token);
        localStorage.setItem("refresh_token", token.refresh_token);
        localStorage.setItem("expires_in", token.expires_in.toString());
        localStorage.setItem(
          "expires",
          new Date(Date.now() + token.expires_in * 1000).toISOString(),
        );
        // Remove code from URL so we can refresh correctly.
        const url = new URL(window.location.href);
        url.searchParams.delete("code");

        const updatedUrl = url.search ? url.href : url.href.replace("?", "/");
        window.history.replaceState({}, document.title, updatedUrl);
      }
    };

    fetchToken();
  }, [code]);

  // TODO: Implement refresh token logic, automatically refresh the token when it expires

  const login = async () => {
    await redirectToSpotifyAuthorize();
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("expires_in");
    localStorage.removeItem("expires");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ accessToken, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};
