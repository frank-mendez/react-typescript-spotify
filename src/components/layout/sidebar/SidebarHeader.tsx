import { Plus, Search, ArrowUpDown } from 'lucide-react';
import type { FilterType } from './types';

function LibraryIcon() {
  return (
    <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
      <path d="M1 0a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1zm.5 1.5H5v13H1.5zm13 13h-8v-13h8z" />
    </svg>
  );
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'playlists', label: 'Playlists' },
  { key: 'artists', label: 'Artists' },
  { key: 'albums', label: 'Albums' },
];

interface SidebarHeaderProps {
  filter: FilterType;
  searchOpen: boolean;
  searchQuery: string;
  onFilterChange: (f: FilterType) => void;
  onSearchOpen: () => void;
  onSearchChange: (q: string) => void;
  onSearchBlur: () => void;
}

export function SidebarHeader({
  filter,
  searchOpen,
  searchQuery,
  onFilterChange,
  onSearchOpen,
  onSearchChange,
  onSearchBlur,
}: Readonly<SidebarHeaderProps>) {
  return (
    <div className="px-4 pt-4 pb-2">
      {/* Title row */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onFilterChange('all')}
          className="flex items-center gap-2 text-[#b3b3b3] hover:text-white transition-colors font-bold text-sm"
          aria-label="Your Library"
        >
          <LibraryIcon />
          <span>Your Library</span>
        </button>
        <button
          className="flex items-center gap-1 text-[#b3b3b3] hover:text-white transition-colors text-xs font-bold px-2 py-1 rounded hover:bg-white/10"
          aria-label="Create playlist"
        >
          <Plus className="w-4 h-4" />
          <span>Create</span>
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-3">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onFilterChange(filter === key ? 'all' : key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              filter === key ? 'bg-white text-black' : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search + sort row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center flex-1 min-w-0">
          {searchOpen ? (
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onBlur={onSearchBlur}
              placeholder="Search in Your Library"
              className="w-full bg-[#2a2a2a] text-white placeholder:text-[#b3b3b3] text-xs rounded px-2 py-1 outline-none border border-[#3a3a3a] focus:border-white"
            />
          ) : (
            <button
              onClick={onSearchOpen}
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
  );
}
