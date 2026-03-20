import { Volume2, VolumeX } from "lucide-react";
import { Slider } from "../../ui/slider";
import { QueueIcon, ConnectDevicesIcon, LyricsQueueIcon, MiniPlayerIcon, ExpandIcon } from "../../icons/player";

interface ExtraControlsProps {
  volume: number;
  onVolumeChange: (value: number) => void;
  onMuteToggle: () => void;
}

export function ExtraControls({ volume, onVolumeChange, onMuteToggle }: Readonly<ExtraControlsProps>) {
  return (
    <div className="flex items-center gap-1" style={{ flex: "0 0 auto" }}>
      <button className="hidden lg:block mx-1" aria-label="Queue" style={{ cursor: "pointer" }}>
        <QueueIcon />
      </button>
      <button className="mx-1" aria-label="Connect to a device">
        <ConnectDevicesIcon />
      </button>
      <button className="mx-1" aria-label="Lyrics / Queue">
        <LyricsQueueIcon />
      </button>
      <button className="hidden lg:block mx-1" aria-label="Mini player" style={{ cursor: "not-allowed" }} disabled>
        <MiniPlayerIcon />
      </button>

      {/* Volume */}
      <div className="flex items-center gap-1 ml-1">
        <button onClick={onMuteToggle} aria-label={volume === 0 ? "Unmute" : "Mute"}>
          {volume === 0
            ? <VolumeX className="w-[17px] h-[17px]" style={{ color: "rgb(186,186,186)" }} />
            : <Volume2 className="w-[17px] h-[17px]" style={{ color: "rgb(186,186,186)" }} />
          }
        </button>
        <Slider
          value={[volume]}
          max={100}
          step={1}
          onValueCommitted={(value) => onVolumeChange(Array.isArray(value) ? value[0] : value)}
          style={{ width: 90 }}
          aria-label="Volume"
        />
      </div>

      <button className="ml-1" aria-label="Expand">
        <ExpandIcon />
      </button>
    </div>
  );
}
