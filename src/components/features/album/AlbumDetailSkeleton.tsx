import { Skeleton } from '../../ui/skeleton';

export function AlbumDetailSkeleton() {
  return (
    <div className="flex flex-col min-h-full" data-testid="album-detail-loading">
      <div className="bg-[linear-gradient(180deg,#1a4a6b_0%,#121212_100%)] p-8">
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
      <div className="flex-1 bg-[#121212] px-6 py-4 flex flex-col gap-2">
        {['sk-0','sk-1','sk-2','sk-3','sk-4','sk-5','sk-6','sk-7'].map((key) => (
          <div key={key} className="flex items-center gap-4 py-2">
            <Skeleton className="w-4 h-4" />
            <div className="flex flex-col gap-1 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-4 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}
