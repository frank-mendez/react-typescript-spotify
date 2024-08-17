import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Dashboard from "../Dashboard.tsx";

describe("Dashboard Component", () => {
  const mockAuthContext = {
    accessToken: "mockAccessToken",
    login: async () => {},
    logout: () => {},
    refreshToken: "mockRefresh",
    getRefreshToken: async () => {},
  };
  const dashboardComponent = () => {
    render(
      <AuthContext.Provider
        value={{
          accessToken: mockAuthContext.accessToken,
          login: mockAuthContext.login,
          logout: mockAuthContext.logout,
          refreshToken: mockAuthContext.refreshToken,
          getRefreshToken: mockAuthContext.getRefreshToken,
        }}
      >
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </AuthContext.Provider>,
    );
  };
  it("renders without crashing", () => {
    dashboardComponent();
    expect(screen.getByTestId("dashboard-element")).toBeInTheDocument();
  });
});
