import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import SearchBar from "./Searchbar.tsx";
import AccountBar from "./AccountBar.tsx";
const Header = () => {
  return (
    <div data-testid="header-element" className="navbar bg-base-300">
      <div className="flex flex-row justify-between w-full">
        <div className="flex-none flex flex-row gap-2">
          <button className="btn btn-circle btn-ghost bg-base-100">
            <ArrowBackIosNewOutlinedIcon />
          </button>
          <button className="btn btn-circle btn-ghost bg-base-100">
            <ArrowForwardIosOutlinedIcon />
          </button>
        </div>
        <div className="justify-center flex flex-row items-center gap-2">
          <button className="btn btn-circle btn-ghost m-auto bg-base-100">
            <HomeOutlinedIcon />
          </button>
          <SearchBar />
        </div>
        <AccountBar />
      </div>
    </div>
  );
};

export default Header;
