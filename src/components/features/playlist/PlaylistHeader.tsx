import { Play, Heart } from 'lucide-react';
import type { Playlist } from '../../../types/spotify';

type PlaylistHeaderPlaylist = Pick<Playlist, 'name' | 'uri' | 'images' | 'owner' | 'tracks'>;

interface PlaylistHeaderProps {
  playlist: PlaylistHeaderPlaylist;
  onPlay: () => void;
}

export function PlaylistHeader({ playlist, onPlay }: Readonly<PlaylistHeaderProps>) {
  const coverImage = playlist.images?.[0]?.url;

  return (
    <div className="bg-[linear-gradient(180deg,#5038a0_0%,#121212_100%)] p-8">
      <div className="flex items-end gap-6">
        {coverImage ? (
          <img
            src={coverImage}
            alt={playlist.name}
            className="w-48 h-48 rounded-sm object-cover shrink-0 shadow-2xl"
            data-testid="playlist-cover"
          />
        ) : (
          <div className="w-48 h-48 rounded-sm bg-surface shrink-0 shadow-2xl" data-testid="playlist-cover-placeholder" />
        )}
        <div className="flex flex-col gap-2 min-w-0">
          <span className="text-text-muted text-xs font-semibold uppercase tracking-widest">Playlist</span>
          <h1 className="text-text-primary text-4xl md:text-5xl font-bold truncate">{playlist.name}</h1>
          <p className="text-text-muted text-sm">
            <span>{playlist.owner?.display_name}</span>
            {playlist.tracks?.total != null && (
              <>{' · '}<span>{playlist.tracks.total} songs</span></>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={onPlay}
          aria-label="Play playlist"
          className="w-12 h-12 rounded-full bg-accent flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Play className="w-5 h-5 text-black fill-black ml-0.5" />
        </button>
        <button
          aria-label="Like playlist"
          className="w-8 h-8 rounded-full border border-text-muted flex items-center justify-center hover:border-text-primary transition-colors"
        >
          <Heart className="w-4 h-4 text-text-muted" />
        </button>
      </div>
    </div>
  );
}
