import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AccountBar from "../AccountBar.tsx";

describe("Accountbar Component", () => {
  const mockAuthContext = {
    accessToken: "mockAccessToken",
    login: async () => {},
    logout: () => {},
    refreshToken: "mockRefresh",
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
            <AccountBar />
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>,
    );
  };
  it("renders without crashing", () => {
    dashboardComponent();
    expect(screen.getByTestId("accountbar-element")).toBeInTheDocument();
  });

  it("contains avatar", () => {
    dashboardComponent();
    expect(screen.getByTestId("avatar-element")).toBeInTheDocument();
  });

  it("contains dropdown", () => {
    dashboardComponent();
    expect(screen.getByTestId("dropdown-element")).toBeInTheDocument();
  });
});
