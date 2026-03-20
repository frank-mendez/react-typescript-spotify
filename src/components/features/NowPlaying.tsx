import { useNavigate } from 'react-router-dom';
import { useCurrentlyPlaying } from '../../hooks/useSpotifyQueries';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';

export function NowPlaying() {
  const navigate = useNavigate();
  const { data: playback, isLoading } = useCurrentlyPlaying();
  const track = playback?.item;

  if (isLoading) {
    return (
      <aside className="hidden xl:flex flex-col w-72 shrink-0 bg-surface rounded-lg p-4 gap-4">
        <Skeleton className="w-full aspect-square rounded" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-28" />
      </aside>
    );
  }

  if (!track) {
    return (
      <aside className="hidden xl:flex flex-col w-72 shrink-0 bg-surface rounded-lg p-4 items-center justify-center">
        <p className="text-text-muted text-xs text-center">Nothing playing right now</p>
      </aside>
    );
  }

  return (
    <aside className="hidden xl:flex flex-col w-72 shrink-0 bg-surface rounded-lg p-4 gap-3">
      <img
        src={track.album?.images?.[0]?.url}
        alt={track.album?.name}
        className="w-full aspect-square object-cover rounded-md"
      />
      <div className="flex flex-col gap-1">
        <span className="text-text-primary text-sm font-semibold truncate">{track.name}</span>
        <span className="text-text-muted text-xs truncate">
          {track.artists.map((a, i) => (
            <span key={a.id}>
              {i > 0 && ', '}
              <button
                onClick={() => navigate('/artist/' + a.id)}
                className="hover:underline cursor-pointer"
              >
                {a.name}
              </button>
            </span>
          ))}
        </span>
        {track.album && (
          <button
            onClick={() => navigate('/album/' + track.album!.id)}
            className="text-text-muted text-xs truncate hover:underline cursor-pointer text-left"
          >
            {track.album.name}
          </button>
        )}
      </div>
      {track.explicit && (
        <Badge variant="outline" className="w-fit text-text-muted border-border text-xs">
          Explicit
        </Badge>
      )}
    </aside>
  );
}
