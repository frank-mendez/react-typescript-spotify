import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Profile from "../Profile.tsx";

describe("Profile Component", () => {
  const mockAuthContext = {
    accessToken: "mockAccessToken",
    login: async () => {},
    logout: () => {},
    refreshToken: "mockRefresh",
  };
  const profileComponent = () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            accessToken: mockAuthContext.accessToken,
            login: mockAuthContext.login,
            logout: mockAuthContext.logout,
            refreshToken: mockAuthContext.refreshToken,
          }}
        >
          <BrowserRouter>
            <Profile />
          </BrowserRouter>
        </AuthContext.Provider>
        ,
      </QueryClientProvider>,
    );
  };
  it("renders without crashing", () => {
    profileComponent();
    expect(screen.getByTestId("profile-card-element")).toBeInTheDocument();
  });

  it("contains a profile image", () => {
    profileComponent();
    expect(screen.getByTestId("profile-img-element")).toBeInTheDocument();
  });
});
