import { FaShuffle } from "react-icons/fa6";
import SkipPreviousOutlinedIcon from "@mui/icons-material/SkipPreviousOutlined";
import PlayCircleFilledOutlinedIcon from "@mui/icons-material/PlayCircleFilledOutlined";
import SkipNextOutlinedIcon from "@mui/icons-material/SkipNextOutlined";
import RepeatOutlinedIcon from "@mui/icons-material/RepeatOutlined";

const MainControls = () => {
  return (
    <div className="flex basis-1/2 flex-col gap-2">
      <div className="flex flex-row gap-2 m-auto mb-5">
        <button className="btn btn-circle btn-ghost bg-base-100">
          <FaShuffle />
        </button>
        <button className="btn btn-circle btn-ghost bg-base-100">
          <SkipPreviousOutlinedIcon />
        </button>
        <button className="btn btn-circle btn-ghost bg-base-100">
          <PlayCircleFilledOutlinedIcon />
        </button>
        <button className="btn btn-circle btn-ghost bg-base-100">
          <SkipNextOutlinedIcon />
        </button>
        <button className="btn btn-circle btn-ghost bg-base-100">
          <RepeatOutlinedIcon />
        </button>
      </div>
      <div className="flex flex-row gap-2 items-center m-auto">
        <p className="text-xs">1:50</p>
        <progress
          className="progress w-[400px]"
          value={50}
          max="100"
        ></progress>
        <p className="text-xs">3:00</p>
      </div>
    </div>
  );
};

export default MainControls;
