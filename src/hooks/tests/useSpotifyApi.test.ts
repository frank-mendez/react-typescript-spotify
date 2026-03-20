import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSpotifyApi } from "../useSpotifyApi";

vi.mock("../useAuth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../useAuth";

describe("useSpotifyApi", () => {
  it("returns null when loading", () => {
    vi.mocked(useAuth).mockReturnValue({
      accessToken: null,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: null,
    });

    const { result } = renderHook(() => useSpotifyApi());
    expect(result.current).toBeNull();
  });

  it("returns null when not authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      accessToken: null,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: null,
    });

    const { result } = renderHook(() => useSpotifyApi());
    expect(result.current).toBeNull();
  });

  it("returns SpotifyApi instance when authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      accessToken: "test-token-123",
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: "refresh-token",
    });

    const { result } = renderHook(() => useSpotifyApi());
    expect(result.current).not.toBeNull();
  });
});
