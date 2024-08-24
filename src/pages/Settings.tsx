import SearchIcon from "@mui/icons-material/Search";

const Settings = () => {
  return (
    <div className="flex flex-col p-6 gap-4">
      <div className="flex flex-row justify-between w-full items-center">
        <h1 className="font-bold text-3xl">Settings</h1>
        <SearchIcon />
      </div>
      <div className="flex flex-col">
        <p className="font-bold text-sm">Language</p>
        <div className="flex flex-row justify-between w-full items-center">
          <p className="text-sm">
            Choose language - Changes will be applied after restarting the app
          </p>
          <select className="select w-full max-w-xs">
            <option disabled selected>
              Pick your favorite Simpson
            </option>
            <option>Homer</option>
            <option>Marge</option>
            <option>Bart</option>
            <option>Lisa</option>
            <option>Maggie</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Settings;
