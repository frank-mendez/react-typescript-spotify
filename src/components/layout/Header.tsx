import { Search, Settings, LogOut, User } from 'lucide-react';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuth } from '../../context/AuthContext';
import { useCurrentUserProfile } from '../../hooks/useSpotifyQueries';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useContentStore } from '../../stores/useContentStore';
import { MainContent } from '../../types/enums';

export function Header() {
  const { logout } = useAuth();
  const { data: profile } = useCurrentUserProfile();
  const navigate = useNavigate();
  const { setCurrentContent } = useContentStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentContent(MainContent.BROWSE);
    }
  };

  const avatarUrl = profile?.images?.[0]?.url;
  const displayName = profile?.display_name ?? 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 h-16 bg-bg/95 backdrop-blur border-b border-border shrink-0" data-testid="header-element">
      <form onSubmit={handleSearch} className="relative max-w-sm w-full hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="What do you want to play?"
          className="pl-9 bg-surface border-border text-text-primary placeholder:text-text-muted focus-visible:ring-accent h-9"
          data-testid="searchbar-element"
        />
      </form>

      <div className="ml-auto" data-testid="accountbar-element">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full hover:bg-surface-hover p-1 transition-colors" data-testid="avatar-element">
              <Avatar className="w-8 h-8">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="bg-accent text-bg text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-text-primary text-sm font-medium hidden md:block pr-1">
                {displayName}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-surface border-border" data-testid="dropdown-element">
            <DropdownMenuItem onClick={() => navigate('/profile')} className="text-text-primary hover:bg-surface-hover cursor-pointer">
              <User className="w-4 h-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="text-text-primary hover:bg-surface-hover cursor-pointer">
              <Settings className="w-4 h-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={logout} className="text-text-primary hover:bg-surface-hover cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
