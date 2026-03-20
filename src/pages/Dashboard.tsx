import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import { PlayerBar } from "../components/layout/PlayerBar";
import { MobileTabBar } from "../components/layout/MobileTabBar";
import { NowPlaying } from "../components/features/NowPlaying";
import { useContentStore } from "../stores/useContentStore";
import { MainContent } from "../types/enums";
import { ScrollArea } from "../components/ui/scroll-area";
import { lazy, Suspense, useEffect, useState } from "react";
import { Skeleton } from "../components/ui/skeleton";
import { useSpotifyPlayer } from "../hooks/useSpotifyPlayer";
import { usePlayerStore } from "../stores/usePlayerStore";
import { useOutlet } from "react-router-dom";
import { RecentlyPlayedSection } from "../components/features/home/RecentlyPlayedSection";

type FilterChip = "All" | "Music" | "Podcasts";

function NavHeader({
  active,
  onChange,
}: Readonly<{
  active: FilterChip;
  onChange: (chip: FilterChip) => void;
}>) {
  const chips: FilterChip[] = ["All", "Music", "Podcasts"];
  return (
    <div className="sticky top-0 z-10 bg-surface px-4 py-2 flex items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip}
          role="checkbox"
          aria-checked={active === chip}
          onClick={() => onChange(chip)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            active === chip
              ? "bg-white text-black"
              : "bg-surface-hover text-text-primary hover:bg-neutral-600"
          }`}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

const Search = lazy(() =>
  import("../components/features/Search").then((m) => ({ default: m.Search })),
);

function MainPanel() {
  const outlet = useOutlet();
  const { currentContent } = useContentStore();

  if (outlet) return outlet;

  if (currentContent === MainContent.BROWSE) {
    return (
      <Suspense
        fallback={
          <div className="p-8">
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
        }
      >
        <Search />
      </Suspense>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-6">
      <RecentlyPlayedSection />
    </div>
  );
}

const Dashboard = () => {
  const { playerState } = useSpotifyPlayer();
  const { setDeviceId } = usePlayerStore();
  const [activeFilter, setActiveFilter] = useState<FilterChip>("All");

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
        <ScrollArea className="flex-1 bg-surface rounded-lg">
          <NavHeader active={activeFilter} onChange={setActiveFilter} />
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
