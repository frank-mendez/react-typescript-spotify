import { lazy, Suspense } from "react";
import { useOutlet } from "react-router-dom";
import { Skeleton } from "../ui/skeleton";
import { useContentStore } from "../../stores/useContentStore";
import { MainContent } from "../../types/enums";
import { NavHeader, useNavHeader } from "../features/home/NavHeader";
import { RecentlyPlayedSection } from "../features/home/RecentlyPlayedSection";

const Search = lazy(() =>
  import("../features/Search").then((m) => ({ default: m.Search })),
);

export function MainPanel() {
  const outlet = useOutlet();
  const { currentContent } = useContentStore();
  const { activeFilter, setActiveFilter } = useNavHeader();

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
    <>
      <NavHeader active={activeFilter} onChange={setActiveFilter} />
      <div className="p-4 flex flex-col gap-6">
        <RecentlyPlayedSection />
      </div>
    </>
  );
}
