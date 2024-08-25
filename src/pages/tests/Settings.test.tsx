import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Settings from "../Settings.tsx";

describe("Settings Component", () => {
  const mockAuthContext = {
    accessToken: "mockAccessToken",
    login: async () => {},
    logout: () => {},
    refreshToken: "mockRefresh",
  };
  const settingsComponent = () => {
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
            <Settings />
          </BrowserRouter>
        </AuthContext.Provider>
        ,
      </QueryClientProvider>,
    );
  };
  it("renders without crashing", () => {
    settingsComponent();
    expect(screen.getByTestId("settings-element")).toBeInTheDocument();
  });

  it("contains a profile image", () => {
    settingsComponent();
    expect(screen.getByTestId("lanaguage-select-element")).toBeInTheDocument();
  });
});
