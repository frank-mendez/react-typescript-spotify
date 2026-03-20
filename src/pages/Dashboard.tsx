import { useEffect } from "react";
import { ScrollArea } from "../components/ui/scroll-area";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import { MainPanel } from "../components/layout/MainPanel";
import { PlayerBar } from "../components/layout/PlayerBar";
import { MobileTabBar } from "../components/layout/MobileTabBar";
import { NowPlaying } from "../components/features/NowPlaying";
import { useSpotifyPlayer } from "../hooks/useSpotifyPlayer";
import { usePlayerStore } from "../stores/usePlayerStore";

const Dashboard = () => {
  const { playerState } = useSpotifyPlayer();
  const { setDeviceId } = usePlayerStore();

  useEffect(() => {
    setDeviceId(playerState.device_id);
  }, [playerState.device_id, setDeviceId]);

  return (
    <div
      className="flex flex-col h-screen bg-bg"
      data-testid="dashboard-element"
    >
      <Header />
      <div className="flex flex-1 gap-2 px-2 pb-2 min-h-0 overflow-hidden">
        <Sidebar />
        <ScrollArea className="flex-1 min-w-0 bg-surface rounded-lg">
          <MainPanel />
        </ScrollArea>
        <NowPlaying />
      </div>
      <PlayerBar />
      <div className="h-16 md:h-20 shrink-0" />
      <MobileTabBar />
    </div>
  );
};

export default Dashboard;
