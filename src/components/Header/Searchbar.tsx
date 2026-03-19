// src/components/SearchBar.tsx
// TODO: Rebuild with shadcn/ui in Task 16

const SearchBar = () => {
  return (
    <div data-testid="searchbar-element" className="relative w-full max-w-md">
      <input
        type="text"
        className="w-full pl-10 pr-10 py-2 rounded-full bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
        placeholder="Search for songs, artists, albums..."
      />
    </div>
  );
};

export default SearchBar;
