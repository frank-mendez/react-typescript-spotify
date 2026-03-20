import { useState, useMemo } from 'react';
import { Plus, Search, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserPlaylists, useSavedAlbums, useFollowedArtists } from '../../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../../hooks/useSpotifyMutations';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { Skeleton } from '../ui/skeleton';

type FilterType = 'all' | 'playlists' | 'artists' | 'albums';

interface LibraryItem {
  id: string;
  name: string;
  imageUrl: string | undefined;
  subtitle: string;
  type: 'playlist' | 'artist' | 'album';
  uri: string;
  isArtist: boolean;
}

function LibraryIcon() {
  return (
    <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
      <path d="M1 0a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1zm.5 1.5H5v13H1.5zm13 13h-8v-13h8z" />
    </svg>
  );
}

function PlayButtonOverlay({ onPlay }: Readonly<{ onPlay: (e: React.MouseEvent) => void }>) {
  return (
    <button
      onClick={onPlay}
      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[inherit]"
      aria-label="Play"
    >
      <div className="w-8 h-8 bg-[#1db954] rounded-full flex items-center justify-center shadow-lg">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="black">
          <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606" />
        </svg>
      </div>
    </button>
  );
}

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
        items.push({
          id: p.id,
          name: p.name,
          imageUrl: p.images?.[0]?.url,
          subtitle: `Playlist • ${p.owner?.display_name ?? 'Spotify'}`,
          type: 'playlist',
          uri: `spotify:playlist:${p.id}`,
          isArtist: false,
        });
      });
    }

    if (filter === 'all' || filter === 'artists') {
      artistsData?.artists?.items?.filter(Boolean).forEach((a) => {
        items.push({
          id: a.id,
          name: a.name,
          imageUrl: a.images?.[0]?.url,
          subtitle: 'Artist',
          type: 'artist',
          uri: `spotify:artist:${a.id}`,
          isArtist: true,
        });
      });
    }

    if (filter === 'all' || filter === 'albums') {
      albumsData?.items?.filter(Boolean).forEach(({ album }) => {
        items.push({
          id: album.id,
          name: album.name,
          imageUrl: album.images?.[0]?.url,
          subtitle: `Album • ${album.artists?.map((a) => a.name).join(', ')}`,
          type: 'album',
          uri: `spotify:album:${album.id}`,
          isArtist: false,
        });
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
    else if (item.type === 'album') navigate('/album/' + item.id);
  };

  const handlePlay = (item: LibraryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    play.mutate({ context_uri: item.uri, device_id: deviceId ?? undefined });
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'playlists', label: 'Playlists' },
    { key: 'artists', label: 'Artists' },
    { key: 'albums', label: 'Albums' },
  ];

  return (
    <aside
      className="hidden md:flex flex-col w-72 lg:w-80 shrink-0 h-full bg-[#121212] rounded-lg overflow-hidden"
      data-testid="sidebar-element"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setFilter('all')}
            className="flex items-center gap-2 text-[#b3b3b3] hover:text-white transition-colors font-bold text-sm"
            aria-label="Your Library"
          >
            <LibraryIcon />
            <span>Your Library</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              className="flex items-center gap-1 text-[#b3b3b3] hover:text-white transition-colors text-xs font-bold px-2 py-1 rounded hover:bg-white/10"
              aria-label="Create playlist"
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap mb-3">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? 'all' : key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                filter === key
                  ? 'bg-white text-black'
                  : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search + Sort row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center flex-1 min-w-0">
            {searchOpen ? (
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                placeholder="Search in Your Library"
                className="w-full bg-[#2a2a2a] text-white placeholder:text-[#b3b3b3] text-xs rounded px-2 py-1 outline-none border border-[#3a3a3a] focus:border-white"
              />
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="text-[#b3b3b3] hover:text-white transition-colors"
                aria-label="Search in Your Library"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            className="flex items-center gap-1 text-[#b3b3b3] hover:text-white transition-colors text-xs font-medium whitespace-nowrap"
            aria-label="Sort"
          >
            <span>Recently added</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Library list */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        <div className="px-2 pb-4">
          {isLoading && Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-2">
              <Skeleton className="w-12 h-12 rounded shrink-0" />
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}

          {!isLoading && filteredItems.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => handleItemClick(item)}
              className="group flex items-center gap-3 px-2 py-2 rounded hover:bg-white/10 transition-colors text-left w-full"
            >
              {/* Image with play overlay */}
              <div className={`relative shrink-0 w-12 h-12 ${item.isArtist ? 'rounded-full' : 'rounded'} overflow-hidden bg-[#2a2a2a]`}>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#333]" />
                )}
                <PlayButtonOverlay onPlay={(e) => handlePlay(item, e)} />
              </div>

              {/* Text */}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-white text-sm font-medium truncate leading-tight">
                  {item.name}
                </span>
                <span className="text-[#b3b3b3] text-xs truncate leading-tight mt-0.5">
                  {item.subtitle}
                </span>
              </div>
            </button>
          ))}

          {!isLoading && filteredItems.length === 0 && (
            <p className="text-[#b3b3b3] text-xs px-2 py-4 text-center">
              {searchQuery ? 'No results found' : 'No items in your library'}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
