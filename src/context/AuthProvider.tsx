import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  getToken,
  redirectToSpotifyAuthorize,
  REQUIRED_SCOPES,
} from "../lib/auth/auth.service";
import { AuthContext } from "./AuthContext";
import { getValidAccessToken } from "../lib/utils/tokenUtils";

function hasRequiredScopes(): boolean {
  const stored = localStorage.getItem("token_scope");
  if (!stored) return false;
  const grantedScopes = new Set(stored.split(" "));
  return REQUIRED_SCOPES.every((s) => grantedScopes.has(s));
}

function clearAllTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("expires_in");
  localStorage.removeItem("expires");
  localStorage.removeItem("token_scope");
}

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
  const exchangeInitiated = useRef(false);

  useEffect(() => {
    const fetchToken = async () => {
      setIsLoading(true);
      try {
        if (code) {
          if (exchangeInitiated.current) return;
          exchangeInitiated.current = true;
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
          // Force re-login if stored token was granted without all required scopes
          if (localStorage.getItem("access_token") && !hasRequiredScopes()) {
            clearAllTokens();
            setAccessToken(null);
            return;
          }
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
    clearAllTokens();
    setAccessToken(null);
  }, []);

  useEffect(() => {
    const handleAuthFailure = () => {
      clearAllTokens();
      setAccessToken(null);
    };
    const handleTokenRefreshed = (e: Event) => {
      const newToken = (e as CustomEvent<string>).detail;
      setAccessToken(newToken);
    };
    globalThis.addEventListener("spotify:auth-failure", handleAuthFailure);
    globalThis.addEventListener(
      "spotify:token-refreshed",
      handleTokenRefreshed,
    );
    return () => {
      globalThis.removeEventListener("spotify:auth-failure", handleAuthFailure);
      globalThis.removeEventListener(
        "spotify:token-refreshed",
        handleTokenRefreshed,
      );
    };
  }, []);

  const contextValue = useMemo(
    () => ({ accessToken, isLoading, login, logout, refreshToken }),
    [accessToken, isLoading, login, logout, refreshToken],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
