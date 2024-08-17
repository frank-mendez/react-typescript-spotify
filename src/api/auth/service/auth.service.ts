import {
  TokenResponse,
  TokenScopeResponse,
} from "../../../data-objects/interface";

const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const clientId = import.meta.env.VITE_CLIENT_ID;
const scope = "user-read-private user-read-email";
const redirectUrl = "http://localhost:5173/";
const tokenEndpoint = "https://accounts.spotify.com/api/token";

export async function redirectToSpotifyAuthorize(): Promise<void> {
  const possible: string =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues: Uint8Array = crypto.getRandomValues(new Uint8Array(64));
  const randomString: string = randomValues.reduce(
    (acc, x) => acc + possible[x % possible.length],
    "",
  );

  const code_verifier: string = randomString;
  const data: Uint8Array = new TextEncoder().encode(code_verifier);
  const hashed: ArrayBuffer = await crypto.subtle.digest("SHA-256", data);

  const code_challenge_base64: string = btoa(
    String.fromCharCode(...new Uint8Array(hashed)),
  )
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  window.localStorage.setItem("code_verifier", code_verifier);

  const authUrl: URL = new URL(authorizationEndpoint);
  const params: Record<string, string> = {
    response_type: "code",
    client_id: clientId,
    scope: scope,
    code_challenge_method: "S256",
    code_challenge: code_challenge_base64,
    redirect_uri: redirectUrl,
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString(); // Redirect the user to the authorization server for login
}

export async function getToken(code: string): Promise<TokenScopeResponse> {
  const code_verifier = localStorage.getItem("code_verifier");

  if (!code_verifier) {
    throw new Error("Code verifier not found in localStorage");
  }

  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUrl,
      code_verifier: code_verifier,
    }),
  };

  const body = await fetch(tokenEndpoint, payload);
  if (!body.ok) {
    throw new Error("Failed to fetch token");
  }

  const response = await body.json();

  return response;
}

export const getRefreshToken = async (
  refreshToken: string,
): Promise<TokenResponse> => {
  // refresh token that has been previously stored
  const url = "https://accounts.spotify.com/api/token";

  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken ?? "",
      client_id: clientId,
    }),
  };
  const body = await fetch(url, payload);
  const response = await body.json();

  return response;
};
