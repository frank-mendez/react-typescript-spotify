import { Search, ChevronLeft, ChevronRight, LogOut, User } from "lucide-react";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuth } from "../../hooks/useAuth";
import { useCurrentUserProfile } from "../../hooks/useSpotifyQueries";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useContentStore } from "../../stores/useContentStore";
import { MainContent } from "../../types/enums";

function SpotifyLogo() {
  return (
    <svg
      stroke="currentColor"
      fill="white"
      strokeWidth="0"
      viewBox="0 0 496 512"
      height="25"
      width="25"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z" />
    </svg>
  );
}

function HomeIcon({ active }: Readonly<{ active: boolean }>) {
  const color = active ? "white" : "#b3b3b3";
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill={color}>
      <path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z" />
    </svg>
  );
}

function BrowseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="#b3b3b3">
      <path d="M15 15.5c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
      <path d="M1.513 9.37A1 1 0 0 1 2.291 9h19.418a1 1 0 0 1 .979 1.208l-2.339 11a1 1 0 0 1-.978.792H4.63a1 1 0 0 1-.978-.792l-2.339-11a1 1 0 0 1 .201-.837zM3.525 11l1.913 9h13.123l1.913-9H3.525zM4 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v4h-2V3H6v3H4V2z" />
    </svg>
  );
}

export function Header() {
  const { logout } = useAuth();
  const { data: profile } = useCurrentUserProfile();
  const navigate = useNavigate();
  const {
    currentContent,
    setCurrentContent,
    setSearchQuery: setStoreSearchQuery,
  } = useContentStore();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setStoreSearchQuery(searchQuery.trim());
      setCurrentContent(MainContent.BROWSE);
    }
  };

  const avatarUrl = profile?.images?.[0]?.url;
  const displayName = profile?.display_name ?? "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const userId = profile?.id;

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-1 h-16 bg-bg/95 backdrop-blur shrink-0"
      data-testid="header-element"
    >
      {/* Left: Spotify logo + back/forward nav */}
      <div className="flex items-center gap-2 pl-2">
        <button
          className="flex items-center justify-center"
          aria-label="Spotify"
        >
          <SpotifyLogo />
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            className="bg-black p-1.5 rounded-full w-8 h-8 flex items-center justify-center hover:bg-neutral-800 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="bg-black p-1.5 rounded-full w-8 h-8 flex items-center justify-center hover:bg-neutral-800 transition-colors"
            aria-label="Go forward"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Center: Home + Search */}
      <div className="hidden md:flex items-center gap-2 flex-1 max-w-lg mx-6">
        <button
          onClick={() => { setCurrentContent(MainContent.PLAYER); navigate('/'); }}
          className="flex items-center justify-center shrink-0 p-1 hover:scale-105 transition-transform"
          aria-label="Home"
        >
          <HomeIcon active={currentContent === MainContent.PLAYER} />
        </button>
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b3b3b3] pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="What do you want to play?"
            className="pl-9 pr-10 bg-surface border-border text-text-primary placeholder:text-text-muted focus-visible:ring-accent h-9 rounded-full"
            data-testid="searchbar-element"
          />
          <button
            type="button"
            onClick={() => setCurrentContent(MainContent.BROWSE)}
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
            aria-label="Browse"
          >
            <BrowseIcon />
          </button>
        </form>
      </div>

      {/* Right: Source code link + Avatar */}
      <div
        className="flex items-center gap-3 pr-2"
        data-testid="accountbar-element"
      >
        <a
          href="https://github.com/frank-mendez/react-typescript-spotify"
          target="_blank"
          rel="noreferrer"
          className="text-[#b3b3b3] hover:text-white text-sm font-medium transition-colors hidden md:block whitespace-nowrap"
        >
          Source code
        </a>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center rounded-full hover:bg-surface-hover p-1 transition-colors"
            data-testid="avatar-element"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="bg-accent text-bg text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-44 bg-surface border-border"
            data-testid="dropdown-element"
          >
            {userId && (
              <DropdownMenuItem
                onClick={() => navigate(`/users/${userId}`)}
                className="text-text-primary hover:bg-surface-hover cursor-pointer"
              >
                <User className="w-4 h-4 mr-2" /> Profile
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={logout}
              className="text-text-primary hover:bg-surface-hover cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
