export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface TokenScopeResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface AuthContextType {
  accessToken: string | null;
  login: () => Promise<void>;
  logout: () => void;
  refreshToken: string | null;
}
