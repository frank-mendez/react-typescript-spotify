import { House, Search, Library, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContentStore } from '../../stores/useContentStore';
import { MainContent } from '../../types/enums';

const tabs = [
  { icon: House, label: 'Home', path: '/', content: MainContent.PLAYER },
  { icon: Search, label: 'Search', path: '/', content: MainContent.BROWSE },
  { icon: Library, label: 'Library', path: '/', content: MainContent.PLAYLISTS },
  { icon: User, label: 'Profile', path: '/profile', content: MainContent.PROFILE },
] as const;

export function MobileTabBar() {
  const navigate = useNavigate();
  const { currentContent, setCurrentContent } = useContentStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border flex md:hidden z-40">
      {tabs.map(({ icon: Icon, label, path, content }) => {
        const isActive = currentContent === content;
        return (
          <button
            key={label}
            onClick={() => { navigate(path); setCurrentContent(content); }}
            className={`flex-1 flex flex-col items-center justify-center gap-1 text-xs transition-colors ${isActive ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
            aria-label={label}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
