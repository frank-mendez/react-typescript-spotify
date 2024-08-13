import {
  getToken,
  redirectToSpotifyAuthorize,
} from "../api/auth/service/auth.service.ts";
import { useEffect } from "react";
import { TokenResponse } from "../data-objects/interface";

const Auth = () => {
  // Data structure that manages the current active token, caching it in localStorage
  const currentToken = {
    get access_token(): string | null {
      return localStorage.getItem("access_token");
    },
    get refresh_token(): string | null {
      return localStorage.getItem("refresh_token");
    },
    get expires_in(): string | null {
      return localStorage.getItem("expires_in");
    },
    get expires(): string | null {
      return localStorage.getItem("expires");
    },

    save: function (response: TokenResponse): void {
      const { access_token, refresh_token, expires_in } = response;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("expires_in", expires_in.toString());

      const now = new Date();
      const expiry = new Date(now.getTime() + expires_in * 1000);
      localStorage.setItem("expires", expiry.toISOString());
    },
  };

  // On page load, try to fetch auth code from current browser search URL
  const args = new URLSearchParams(window.location.search);
  const code = args.get("code");

  // If we find a code, we're in a callback, do a token exchange
  useEffect(() => {
    const fetchToken = async () => {
      if (code) {
        const token = await getToken(code);

        console.log("token", token);

        currentToken.save(token);
        // Remove code from URL so we can refresh correctly.
        const url = new URL(window.location.href);
        url.searchParams.delete("code");

        const updatedUrl = url.search ? url.href : url.href.replace("?", "");
        window.history.replaceState({}, document.title, updatedUrl);
      }
    };

    fetchToken();
  }, [code]);

  const onLogin = async () => {
    await redirectToSpotifyAuthorize();
  };

  return (
    <button onClick={onLogin} className="btn btn-primary">
      Login
    </button>
  );
};

export default Auth;
