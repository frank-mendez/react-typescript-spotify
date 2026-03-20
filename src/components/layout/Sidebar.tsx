import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserPlaylists, useSavedAlbums, useFollowedArtists } from '../../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../../hooks/useSpotifyMutations';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { LibraryList } from './sidebar/LibraryList';
import type { FilterType, LibraryItem } from './sidebar/types';

export function Sidebar() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: playlistsData, isLoading: playlistsLoading } = useUserPlaylists(50);
  const { data: albumsData, isLoading: albumsLoading } = useSavedAlbums(50);
  const { data: artistsData, isLoading: artistsLoading } = useFollowedArtists(50);
  const { play } = usePlaybackControls();
  const { deviceId } = usePlayerStore();

  const isLoading = playlistsLoading || albumsLoading || artistsLoading;

  const allItems = useMemo<LibraryItem[]>(() => {
    const items: LibraryItem[] = [];

    if (filter === 'all' || filter === 'playlists') {
      playlistsData?.items?.filter(Boolean).forEach((p) => {
        items.push({ id: p.id, name: p.name, imageUrl: p.images?.[0]?.url, subtitle: `Playlist • ${p.owner?.display_name ?? 'Spotify'}`, type: 'playlist', uri: `spotify:playlist:${p.id}`, isArtist: false });
      });
    }
    if (filter === 'all' || filter === 'artists') {
      artistsData?.artists?.items?.filter(Boolean).forEach((a) => {
        items.push({ id: a.id, name: a.name, imageUrl: a.images?.[0]?.url, subtitle: 'Artist', type: 'artist', uri: `spotify:artist:${a.id}`, isArtist: true });
      });
    }
    if (filter === 'all' || filter === 'albums') {
      albumsData?.items?.filter(Boolean).forEach(({ album }) => {
        items.push({ id: album.id, name: album.name, imageUrl: album.images?.[0]?.url, subtitle: `Album • ${album.artists?.map((a) => a.name).join(', ')}`, type: 'album', uri: `spotify:album:${album.id}`, isArtist: false });
      });
    }

    return items;
  }, [playlistsData, albumsData, artistsData, filter]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;
    const q = searchQuery.toLowerCase();
    return allItems.filter((item) => item.name.toLowerCase().includes(q));
  }, [allItems, searchQuery]);

  const handleItemClick = (item: LibraryItem) => {
    if (item.type === 'playlist') navigate('/playlist/' + item.id);
    else if (item.type === 'artist') navigate('/artist/' + item.id);
    else navigate('/album/' + item.id);
  };

  const handlePlay = (item: LibraryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    play.mutate({ context_uri: item.uri, device_id: deviceId ?? undefined });
  };

  return (
    <aside
      className="hidden md:flex flex-col w-72 lg:w-80 shrink-0 h-full bg-[#121212] rounded-lg overflow-hidden"
      data-testid="sidebar-element"
    >
      <SidebarHeader
        filter={filter}
        searchOpen={searchOpen}
        searchQuery={searchQuery}
        onFilterChange={setFilter}
        onSearchOpen={() => setSearchOpen(true)}
        onSearchChange={setSearchQuery}
        onSearchBlur={() => { if (!searchQuery) setSearchOpen(false); }}
      />
      <LibraryList
        isLoading={isLoading}
        items={filteredItems}
        searchQuery={searchQuery}
        onNavigate={handleItemClick}
        onPlay={handlePlay}
      />
    </aside>
  );
}
