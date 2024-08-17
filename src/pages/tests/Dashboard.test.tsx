import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Dashboard from "../Dashboard.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("Dashboard Component", () => {
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
            <Dashboard />
          </BrowserRouter>
        </AuthContext.Provider>
        ,
      </QueryClientProvider>,
    );
  };
  it("renders without crashing", () => {
    dashboardComponent();
    expect(screen.getByTestId("dashboard-element")).toBeInTheDocument();
  });

  it("contains a header", () => {
    dashboardComponent();
    expect(screen.getByTestId("header-element")).toBeInTheDocument();
  });

  it("contains a footer", () => {
    dashboardComponent();
    expect(screen.getByTestId("footer-element")).toBeInTheDocument();
  });

  it("contains a sidebar", () => {
    dashboardComponent();
    expect(screen.getByTestId("sidebar-element")).toBeInTheDocument();
  });

  it("contains a main content", () => {
    dashboardComponent();
    expect(screen.getByTestId("main-content-element")).toBeInTheDocument();
  });

  it("contains a expand content", () => {
    dashboardComponent();
    expect(screen.getByTestId("expand-content-element")).toBeInTheDocument();
  });
});
