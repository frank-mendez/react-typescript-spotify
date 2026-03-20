import { Slider } from "../../ui/slider";
import { ShuffleIcon, PrevIcon, PlayIcon, PauseIcon, NextIcon, RepeatIcon } from "../../icons/player";

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getNextRepeatState(current: string): "off" | "context" | "track" {
  if (current === "off") return "context";
  if (current === "context") return "track";
  return "off";
}

interface PlaybackControlsProps {
  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
  shuffleState: boolean;
  repeatState: string;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onShuffle: (state: boolean) => void;
  onRepeat: (state: "off" | "context" | "track") => void;
  onSeek: (positionMs: number) => void;
}

export function PlaybackControls({
  isPlaying,
  progressMs,
  durationMs,
  shuffleState,
  repeatState,
  onPlayPause,
  onPrevious,
  onNext,
  onShuffle,
  onRepeat,
  onSeek,
}: Readonly<PlaybackControlsProps>) {
  return (
    <div className="flex flex-col items-center w-2/5" style={{ marginTop: 5, marginBottom: -5 }}>
      {/* Transport buttons */}
      <div className="flex items-center gap-6 mb-1">
        <button onClick={() => onShuffle(!shuffleState)} aria-label="Toggle shuffle">
          <ShuffleIcon active={shuffleState} />
        </button>
        <button onClick={onPrevious} aria-label="Previous track">
          <PrevIcon />
        </button>
        <button
          onClick={onPlayPause}
          className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button onClick={onNext} aria-label="Next track">
          <NextIcon />
        </button>
        <button onClick={() => onRepeat(getNextRepeatState(repeatState))} aria-label="Toggle repeat">
          <RepeatIcon state={repeatState} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex items-center justify-between w-full">
        <span className="text-white mr-2 text-xs tabular-nums">{formatMs(progressMs)}</span>
        <Slider
          value={[progressMs]}
          max={durationMs || 1}
          step={1000}
          onValueCommitted={(value) => onSeek(Array.isArray(value) ? value[0] : value)}
          className="flex-1"
          aria-label="Track progress"
        />
        <span className="text-white ml-2 text-xs tabular-nums">{formatMs(durationMs)}</span>
      </div>
    </div>
  );
}
