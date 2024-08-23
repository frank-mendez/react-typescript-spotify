// src/components/SearchBar.tsx
import SearchIcon from "@mui/icons-material/Search";
import BrowseGalleryOutlinedIcon from "@mui/icons-material/BrowseGalleryOutlined";

const SearchBar = () => {
  return (
    <div data-testid="searchbar-element" className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <SearchIcon className="text-gray-500" />
      </div>
      <input
        type="text"
        className="w-full pl-10 pr-10 py-2 rounded-full bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
        placeholder="Search for songs, artists, albums..."
      />
      <button className="absolute inset-y-0 right-0 flex items-center pr-3">
        <BrowseGalleryOutlinedIcon className="text-gray-500" />
      </button>
    </div>
  );
};

export default SearchBar;
