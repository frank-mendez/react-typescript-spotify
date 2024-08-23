import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Login from "../Login.tsx";

describe("Login Component", () => {
  const mockAuthContext = {
    accessToken: null,
    login: async () => {},
    logout: () => {},
    refreshToken: "mockRefresh",
    getRefreshToken: async () => {},
  };
  const loginComponent = () => {
    render(
      <AuthContext.Provider
        value={{
          accessToken: null,
          login: mockAuthContext.login,
          logout: mockAuthContext.logout,
          refreshToken: mockAuthContext.refreshToken,
        }}
      >
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthContext.Provider>,
    );
  };
  it("renders without crashing", () => {
    loginComponent();
    expect(screen.getByTestId("login-page-component")).toBeInTheDocument();
  });

  it("renders login button", () => {
    loginComponent();
    expect(screen.getByTestId("login-button")).toBeInTheDocument();
  });
});
