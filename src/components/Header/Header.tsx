// TODO: Rebuild with shadcn/ui in Task 16
import SearchBar from "./Searchbar.tsx";
import AccountBar from "./AccountBar.tsx";
const Header = () => {
  return (
    <div data-testid="header-element" className="navbar bg-base-300">
      <div className="flex flex-row justify-between w-full">
        <div className="justify-center flex flex-row items-center gap-2">
          <SearchBar />
        </div>
        <AccountBar />
      </div>
    </div>
  );
};

export default Header;
