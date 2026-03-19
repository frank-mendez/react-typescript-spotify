import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { PlayerBar } from '../components/layout/PlayerBar';
import { MobileTabBar } from '../components/layout/MobileTabBar';
import { NowPlaying } from '../components/features/NowPlaying';
import { useContentStore } from '../stores/useContentStore';
import { MainContent } from '../types/enums';
import { ScrollArea } from '../components/ui/scroll-area';
import Profile from './Profile';
import Settings from './Settings';
import { lazy, Suspense, useEffect } from 'react';
import { Skeleton } from '../components/ui/skeleton';
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer';
import { usePlayerStore } from '../stores/usePlayerStore';

const Search = lazy(() => import('../components/features/Search').then((m) => ({ default: m.Search })));

function MainPanel() {
  const { currentContent } = useContentStore();

  switch (currentContent) {
    case MainContent.PROFILE:
      return <Profile />;
    case MainContent.SETTINGS:
      return <Settings />;
    case MainContent.BROWSE:
      return (
        <Suspense fallback={<div className="p-8"><Skeleton className="h-10 w-full max-w-md" /></div>}>
          <Search />
        </Suspense>
      );
    default:
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <p className="text-text-muted text-sm">Open Spotify on a device to start playing</p>
        </div>
      );
  }
}

const Dashboard = () => {
  const { playerState } = useSpotifyPlayer();
  const { setDeviceId } = usePlayerStore();

  useEffect(() => {
    setDeviceId(playerState.device_id);
  }, [playerState.device_id, setDeviceId]);

  return (
    <div className="flex flex-col h-screen bg-bg" data-testid="dashboard-element">
      <Header />
      <div className="flex flex-1 gap-2 px-2 pb-2 min-h-0 overflow-hidden">
        <Sidebar />
        <ScrollArea className="flex-1 bg-surface rounded-lg">
          <MainPanel />
        </ScrollArea>
        <NowPlaying />
      </div>
      {/* Player bar — mini-strip on mobile, full bar on desktop */}
      <PlayerBar />
      {/* Bottom spacer for fixed bars */}
      <div className="h-16 md:h-20 shrink-0" />
      {/* Mobile tab bar */}
      <MobileTabBar />
    </div>
  );
};

export default Dashboard;
