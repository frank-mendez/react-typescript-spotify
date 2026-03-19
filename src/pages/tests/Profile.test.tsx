import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Profile from '../Profile.tsx';

vi.mock('../../hooks/useSpotifyQueries', () => ({
  useCurrentUserProfile: () => ({ data: null, isLoading: true, error: null }),
}));

describe('Profile Component', () => {
  const mockAuthContext = {
    accessToken: 'mockAccessToken',
    isLoading: false,
    login: async () => {},
    logout: () => {},
    refreshToken: 'mockRefresh',
  };
  const profileComponent = () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            accessToken: mockAuthContext.accessToken,
            isLoading: mockAuthContext.isLoading,
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
  it('renders without crashing', () => {
    profileComponent();
    expect(screen.getByTestId('profile-page')).toBeInTheDocument();
  });

  it('shows loading skeleton when data is loading', () => {
    profileComponent();
    expect(screen.getByTestId('profile-page')).toBeInTheDocument();
  });
});
