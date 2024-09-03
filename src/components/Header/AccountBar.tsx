import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import LaunchIcon from "@mui/icons-material/Launch";
import { useAuth } from "../../context/AuthContext.tsx";
import { useProfileQuery } from "../../api/user";
import { Link } from "react-router-dom";
import { useContentStore } from "../../stores/useContentStore.ts";
import { MainContent } from "../../data-objects/enum";

const AccountBar = () => {
  const { logout, accessToken } = useAuth();
  const handleLogout = () => {
    logout();
  };
  const { data, isPending } = useProfileQuery(accessToken ?? "");

  const { setCurrentContent } = useContentStore();
  const srcImage = "/assets/images/post_malone.jpg";
  return (
    <div
      data-testid="accountbar-element"
      className="flex-none flex flex-row gap-2 items-center justify-center"
    >
      <button className="btn btn-circle btn-ghost m-auto bg-base-100">
        <NotificationsNoneOutlinedIcon />
      </button>
      <button className="btn btn-circle btn-ghost m-auto bg-base-100">
        <PeopleOutlineOutlinedIcon />
      </button>
      <div className="dropdown dropdown-end">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-ghost btn-circle avatar"
        >
          <div
            data-testid="avatar-element"
            className={`w-10 rounded-full ${isPending ? "skeleton" : ""}`}
          >
            {!isPending && (
              <img alt="Tailwind CSS Navbar component" src={srcImage} />
            )}
          </div>
        </div>
        <ul
          data-testid="dropdown-element"
          tabIndex={0}
          className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
        >
          <li>
            <Link
              target="_blank"
              to={data?.external_urls?.spotify ?? ""}
              className="justify-between"
            >
              Account
              <LaunchIcon />
            </Link>
          </li>
          <li>
            <button onClick={() => setCurrentContent(MainContent.PROFILE)}>
              Profile
            </button>
          </li>
          <li>
            <a>Private session</a>
          </li>
          <li>
            <button onClick={() => setCurrentContent(MainContent.SETTINGS)}>
              Settings
            </button>
          </li>
          <div className="divider m-0"></div>
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AccountBar;
