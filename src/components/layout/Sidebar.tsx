import { House, Search, Library, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserPlaylists } from '../../hooks/useSpotifyQueries';
import { useContentStore } from '../../stores/useContentStore';
import { MainContent } from '../../types/enums';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';

export function Sidebar() {
  const navigate = useNavigate();
  const { currentContent, setCurrentContent } = useContentStore();
  const { data: playlists, isLoading, error } = useUserPlaylists(50);

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 gap-2 h-full" data-testid="sidebar-element">
      {/* Nav */}
      <nav className="bg-surface rounded-lg p-4 flex flex-col gap-1">
        <button
          onClick={() => { navigate('/'); setCurrentContent(MainContent.PLAYER); }}
          className={`flex items-center gap-4 px-2 py-2 rounded text-sm font-semibold transition-colors hover:text-text-primary ${currentContent === MainContent.PLAYER ? 'text-text-primary' : 'text-text-muted'}`}
        >
          <House className="w-6 h-6" />
          Home
        </button>
        <button
          onClick={() => setCurrentContent(MainContent.BROWSE)}
          className={`flex items-center gap-4 px-2 py-2 rounded text-sm font-semibold transition-colors hover:text-text-primary ${currentContent === MainContent.BROWSE ? 'text-text-primary' : 'text-text-muted'}`}
        >
          <Search className="w-6 h-6" />
          Search
        </button>
      </nav>

      {/* Library */}
      <div className="flex-1 flex flex-col min-h-0 bg-surface rounded-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setCurrentContent(MainContent.PLAYLISTS)}
            className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm font-semibold transition-colors"
          >
            <Library className="w-5 h-5" />
            Your Library
          </button>
          <button
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label="Create playlist"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-2 pb-2 flex flex-col gap-0.5">
            {isLoading && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2">
                <Skeleton className="w-10 h-10 rounded shrink-0" />
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
            {error && <p className="text-text-muted text-xs px-2 py-4">Could not load playlists</p>}
            {playlists?.items?.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => setCurrentContent(MainContent.PLAYLISTS)}
                className="flex items-center gap-3 px-2 py-2 rounded hover:bg-surface-hover transition-colors text-left w-full"
              >
                <img
                  src={playlist.images?.[0]?.url}
                  alt={playlist.name}
                  className="w-10 h-10 rounded shrink-0 object-cover bg-border"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-text-primary text-sm font-medium truncate">{playlist.name}</span>
                  <span className="text-text-muted text-xs truncate">
                    Playlist · {playlist.tracks?.total ?? 0} tracks
                  </span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
