import SmartDisplayOutlinedIcon from "@mui/icons-material/SmartDisplayOutlined";
import LyricsOutlinedIcon from "@mui/icons-material/LyricsOutlined";
import HorizontalSplitOutlinedIcon from "@mui/icons-material/HorizontalSplitOutlined";
import PhonelinkOutlinedIcon from "@mui/icons-material/PhonelinkOutlined";
import VolumeDownOutlinedIcon from "@mui/icons-material/VolumeDownOutlined";
import AspectRatioOutlinedIcon from "@mui/icons-material/AspectRatioOutlined";

const SideControls = () => {
  return (
    <div className="basis-1/4 flex flex-row gap-1 items-center justify-end">
      <button className="btn btn-sm btn-circle btn-ghost bg-base-100">
        <SmartDisplayOutlinedIcon />
      </button>
      <button className="btn btn-sm btn-circle btn-ghost bg-base-100">
        <LyricsOutlinedIcon />
      </button>
      <button className="btn btn-sm btn-circle btn-ghost bg-base-100">
        <HorizontalSplitOutlinedIcon />
      </button>
      <button className="btn btn-sm btn-circle btn-ghost bg-base-100">
        <PhonelinkOutlinedIcon />
      </button>
      <button className="btn btn-sm btn-circle btn-ghost bg-base-100">
        <VolumeDownOutlinedIcon />
      </button>
      <progress className="progress w-[100px]" value={50} max="100"></progress>
      <button className="btn btn-sm btn-circle btn-ghost bg-base-100">
        <AspectRatioOutlinedIcon />
      </button>
    </div>
  );
};

export default SideControls;
