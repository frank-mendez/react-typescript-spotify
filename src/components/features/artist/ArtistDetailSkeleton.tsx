import { Skeleton } from '../../ui/skeleton';

export function ArtistDetailSkeleton() {
  return (
    <div className="flex flex-col min-h-full" data-testid="artist-detail-loading">
      <div className="bg-[linear-gradient(180deg,#1a5a4a_0%,#121212_100%)] p-8">
        <div className="flex items-end gap-6">
          <Skeleton className="w-32 h-32 rounded-full shrink-0" />
          <div className="flex flex-col gap-3 flex-1">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-6">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="w-24 h-9 rounded-full" />
        </div>
      </div>
      <div className="flex-1 bg-[#121212] px-6 py-4 flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`skeleton-artist-${i}`} className="flex items-center gap-4 py-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="w-10 h-10 rounded" />
            <div className="flex flex-col gap-1 flex-1">
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}
