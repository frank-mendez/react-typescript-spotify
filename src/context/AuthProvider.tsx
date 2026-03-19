import { useEffect, useState, useMemo } from "react";
import {
  getToken,
  redirectToSpotifyAuthorize,
} from "../lib/auth/auth.service.ts";
import { AuthContext } from "./AuthContext";
import { getValidAccessToken, debugTokenInfo } from "../lib/utils/tokenUtils";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("access_token")
  );
  const refreshToken = localStorage.getItem("refresh_token");
  const args = new URLSearchParams(window.location.search);
  const code = args.get("code");

  useEffect(() => {
    const fetchToken = async () => {
      if (code) {
        try {
          console.log('Exchanging authorization code for tokens...');
          const token = await getToken(code);

          localStorage.setItem("access_token", token.access_token);
          localStorage.setItem("refresh_token", token.refresh_token);
          localStorage.setItem("expires_in", token.expires_in.toString());
          localStorage.setItem(
            "expires",
            new Date(Date.now() + token.expires_in * 1000).toISOString(),
          );
          
          setAccessToken(token.access_token);
          
          // Remove code from URL so we can refresh correctly.
          const url = new URL(window.location.href);
          url.searchParams.delete("code");

          const updatedUrl = url.search ? url.href : url.href.replace("?", "/");
          window.history.replaceState({}, document.title, updatedUrl);
          
          console.log('Tokens stored successfully');
          debugTokenInfo();
        } catch (error) {
          console.error('Error exchanging code for tokens:', error);
        }
      } else {
        // Check if we have a valid token on initial load
        const validToken = await getValidAccessToken();
        setAccessToken(validToken);
        
        if (validToken) {
          console.log('Valid token found');
          debugTokenInfo();
        }
      }
    };

    fetchToken();
  }, [code]);

  const login = async () => {
    await redirectToSpotifyAuthorize();
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("expires_in");
    localStorage.removeItem("expires");
    setAccessToken(null);
  };

  const contextValue = useMemo(() => ({
    accessToken,
    isLoading: false,
    login,
    logout,
    refreshToken
  }), [accessToken, login, logout, refreshToken]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
