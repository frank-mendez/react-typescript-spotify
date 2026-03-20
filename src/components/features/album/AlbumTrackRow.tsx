import { Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Artist {
  id: string;
  name: string;
}

interface AlbumTrack {
  id: string;
  name: string;
  duration_ms: number;
  artists: Artist[];
}

interface AlbumTrackRowProps {
  track: AlbumTrack;
  index: number;
  isCurrentTrack: boolean;
  isActiveAndPlaying: boolean;
  formattedDuration: string;
  onPlay: () => void;
  onPause: () => void;
}

function EqualizerBars() {
  return (
    <span className="inline-flex items-end gap-[2px] w-4 h-4" aria-hidden>
      <span className="inline-block w-[3px] bg-accent rounded-sm animate-eq-bar1" style={{ height: '3px' }} />
      <span className="inline-block w-[3px] bg-accent rounded-sm animate-eq-bar2" style={{ height: '8px' }} />
      <span className="inline-block w-[3px] bg-accent rounded-sm animate-eq-bar3" style={{ height: '12px' }} />
      <span className="inline-block w-[3px] bg-accent rounded-sm animate-eq-bar2" style={{ height: '5px' }} />
    </span>
  );
}

function TrackIndexCell({ index, isCurrentTrack, isActiveAndPlaying }: {
  index: number;
  isCurrentTrack: boolean;
  isActiveAndPlaying: boolean;
}) {
  if (isActiveAndPlaying) {
    return (
      <>
        <Pause className="w-4 h-4 text-accent fill-accent hidden group-hover:block" />
        <span className="group-hover:hidden"><EqualizerBars /></span>
      </>
    );
  }
  if (isCurrentTrack) {
    return (
      <>
        <Play className="w-4 h-4 text-accent fill-accent hidden group-hover:block" />
        <span className="text-sm font-medium text-accent group-hover:hidden">{index + 1}</span>
      </>
    );
  }
  return (
    <>
      <Play className="w-4 h-4 text-text-primary fill-text-primary hidden group-hover:block" />
      <span className="text-sm font-medium text-text-muted group-hover:hidden">{index + 1}</span>
    </>
  );
}

export function AlbumTrackRow({
  track,
  index,
  isCurrentTrack,
  isActiveAndPlaying,
  formattedDuration,
  onPlay,
  onPause,
}: AlbumTrackRowProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isCurrentTrack) {
      isActiveAndPlaying ? onPause() : onPlay();
    } else {
      onPlay();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      key={`${track.id}-${index}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${track.name} by ${track.artists.map((a) => a.name).join(', ')}`}
      className="grid grid-cols-[2rem_1fr_4rem] gap-4 px-2 py-2 rounded hover:bg-[#ffffff10] cursor-pointer group items-center"
    >
      <div className="flex items-center justify-end w-full">
        <TrackIndexCell index={index} isCurrentTrack={isCurrentTrack} isActiveAndPlaying={isActiveAndPlaying} />
      </div>

      <div className="flex flex-col min-w-0">
        <span className={`text-sm truncate font-medium ${isCurrentTrack ? 'text-accent' : 'text-text-primary'}`}>
          {track.name}
        </span>
        <span className="text-xs text-text-muted truncate">
          {track.artists.map((artist, i) => (
            <span key={artist.id}>
              {i > 0 && ', '}
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/artist/${artist.id}`); }}
                className="hover:text-text-primary hover:underline"
              >
                {artist.name}
              </button>
            </span>
          ))}
        </span>
      </div>

      <span className="text-xs text-text-muted text-right">{formattedDuration}</span>
    </div>
  );
}
