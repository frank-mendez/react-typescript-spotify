import { useEffect, useState, useMemo, useCallback } from "react";
import { getToken, redirectToSpotifyAuthorize } from "../lib/auth/auth.service";
import { AuthContext } from "./AuthContext";
import { getValidAccessToken } from "../lib/utils/tokenUtils";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("access_token"),
  );
  const [isLoading, setIsLoading] = useState(true);

  const refreshToken = localStorage.getItem("refresh_token");
  const args = new URLSearchParams(globalThis.location.search);
  const code = args.get("code");

  useEffect(() => {
    const fetchToken = async () => {
      setIsLoading(true);
      try {
        if (code) {
          const token = await getToken(code);
          localStorage.setItem("access_token", token.access_token);
          localStorage.setItem("refresh_token", token.refresh_token);
          localStorage.setItem("expires_in", token.expires_in.toString());
          localStorage.setItem(
            "expires",
            new Date(Date.now() + token.expires_in * 1000).toISOString(),
          );
          setAccessToken(token.access_token);
          const url = new URL(globalThis.location.href);
          url.searchParams.delete("code");
          const updatedUrl = url.search ? url.href : url.href.replace("?", "/");
          globalThis.history.replaceState({}, document.title, updatedUrl);
        } else {
          const validToken = await getValidAccessToken();
          setAccessToken(validToken);
        }
      } catch {
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [code]);

  const login = useCallback(async () => {
    await redirectToSpotifyAuthorize();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("expires_in");
    localStorage.removeItem("expires");
    setAccessToken(null);
  }, []);

  const contextValue = useMemo(
    () => ({ accessToken, isLoading, login, logout, refreshToken }),
    [accessToken, isLoading, login, logout, refreshToken],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
