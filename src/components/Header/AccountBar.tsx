import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";

const AccountBar = () => {
  return (
    <div className="flex-none flex flex-row gap-2 items-center justify-center">
      <button className="btn btn-circle btn-ghost m-auto bg-base-100">
        <NotificationsNoneOutlinedIcon />
      </button>
      <button className="btn btn-circle btn-ghost m-auto bg-base-100">
        <PeopleOutlineOutlinedIcon />
      </button>
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle avatar"
      >
        <div className="w-10 rounded-full">
          <img
            alt="Tailwind CSS Navbar component"
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
          />
        </div>
      </div>
    </div>
  );
};

export default AccountBar;
