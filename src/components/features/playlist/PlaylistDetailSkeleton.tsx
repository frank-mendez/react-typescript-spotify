import { Skeleton } from '../../ui/skeleton';

export function PlaylistDetailSkeleton() {
  return (
    <div className="flex flex-col min-h-full" data-testid="playlist-detail-loading">
      <div className="bg-[linear-gradient(180deg,#5038a0_0%,#121212_100%)] p-8">
        <div className="flex items-end gap-6">
          <Skeleton className="w-48 h-48 rounded-sm shrink-0" />
          <div className="flex flex-col gap-3 flex-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-6">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}
