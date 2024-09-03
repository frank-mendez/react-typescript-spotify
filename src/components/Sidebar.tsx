import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SideCard from "./Footer/SideCard.tsx";

const Sidebar = () => {
  const sidebarData = [
    {
      img: "/assets/images/region_global_default.jpg",
      title: "Top 50 Global",
      artist: "Playlist - Spotify",
      active: true,
    },
    {
      img: "/assets/images/region_ph_default.jpg",
      title: "Top 50 Philippines",
      artist: "Playlist - Spotify",
      active: false,
    },
    {
      img: "/assets/images/region_br_default.jpg",
      title: "Top 50 Brazil",
      artist: "Playlist - Spotify",
      active: false,
    },
    {
      img: "/assets/images/region_dk_default.jpg",
      title: "Top 50 Denmark",
      artist: "Playlist - Spotify",
      active: false,
    },
    {
      img: "/assets/images/region_fr_default.jpg",
      title: "Top 50 France",
      artist: "Playlist - Spotify",
      active: false,
    },
  ];
  return (
    <div
      data-testid="sidebar-element"
      className="rounded-2xl my-10 bg-base-300 min-h-fit basis-1/8 p-4"
    >
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-row gap-2 w-full justify-between items-center">
          <div className="flex flex-row gap-2 items-center">
            <button className="btn btn-circle btn-ghost bg-base-100">
              <ViewColumnIcon />
            </button>
            <p className="font-bold">Your Library</p>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <button className="btn btn-circle btn-ghost bg-base-100">
              <AddIcon />
            </button>
            <button className="btn btn-circle btn-ghost bg-base-100">
              <ArrowForwardIcon />
            </button>
          </div>
        </div>
        <div className="flex flex-row gap-2 w-full overflow-x-auto">
          <button className="badge badge-neutral p-4">Playlists</button>
          <button className="badge badge-neutral p-4">Artists</button>
          <button className="badge badge-neutral p-4">Podcasts</button>
          <button className="badge badge-neutral p-4">Albums</button>
        </div>
        <div className="flex flex-col w-full">
          {sidebarData.map((data, index) => (
            <SideCard
              key={index}
              img={data.img}
              title={data.title}
              artist={data.artist}
              active={data.active}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
