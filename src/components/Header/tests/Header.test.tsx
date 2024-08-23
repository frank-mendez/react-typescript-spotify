import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import Header from "../Header.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("Header Component", () => {
  const mockAuthContext = {
    accessToken: "mockAccessToken",
    login: async () => {},
    logout: () => {},
    refreshToken: "mockRefresh",
    getRefreshToken: async () => {},
  };
  const dashboardComponent = () => {
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
            <Header />
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>,
    );
  };
  it("renders without crashing", () => {
    dashboardComponent();
    expect(screen.getByTestId("header-element")).toBeInTheDocument();
  });

  it("contains searchbar", () => {
    dashboardComponent();
    expect(screen.getByTestId("searchbar-element")).toBeInTheDocument();
  });

  it("contains accountbar", () => {
    dashboardComponent();
    expect(screen.getByTestId("accountbar-element")).toBeInTheDocument();
  });
});
