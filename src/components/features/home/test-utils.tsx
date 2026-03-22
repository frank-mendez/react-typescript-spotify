import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc },
    createElement(MemoryRouter, null, children)
  );
}

export const makePlaylist = (id: string) => ({
  id,
  name: `Playlist ${id}`,
  description: '',
  uri: `spotify:playlist:${id}`,
  images: [{ url: `https://img/${id}.jpg` }],
  owner: { id: 'spotify', display_name: 'Spotify', type: 'user' as const, href: '', uri: '', external_urls: { spotify: '' } },
  followers: { total: 0 },
  tracks: { href: '', total: 5 },
  collaborative: false,
  public: true,
  snapshot_id: 'snap',
  type: 'playlist' as const,
  href: '',
  external_urls: { spotify: '' },
});
