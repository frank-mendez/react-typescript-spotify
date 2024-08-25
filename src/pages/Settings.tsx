import SearchIcon from "@mui/icons-material/Search";

const Settings = () => {
  return (
    <div data-testid="settings-element" className="flex flex-col p-6 gap-4">
      <div className="flex flex-row justify-between w-full items-center">
        <h1
          data-testid="settings-header-element"
          className="font-bold text-3xl"
        >
          Settings
        </h1>
        <SearchIcon />
      </div>
      <div data-testid="lanaguage-select-element" className="flex flex-col">
        <p className="font-bold text-sm">Language</p>
        <div className="flex flex-row justify-between w-full items-center">
          <p className="text-sm">
            Choose language - Changes will be applied after restarting the app
          </p>
          <select className="select w-full max-w-xs">
            <option>English</option>
            <option>Japanese</option>
            <option>Chinese</option>
            <option>French</option>
            <option>Swedish</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col">
        <p className="font-bold text-sm">Explicit Content</p>
        <div className="flex flex-row justify-between w-full items-center">
          <p className="text-sm">Allow playback of explicit-rated content</p>
          <input type="checkbox" className="toggle" defaultChecked />
        </div>
      </div>
      <div className="flex flex-col">
        <p className="font-bold text-sm">Autoplay</p>
        <div className="flex flex-row justify-between w-full items-center">
          <p className="text-sm">
            Enjoy nonstop listening. When your audio ends, we'll play you
            something similar
          </p>
          <input type="checkbox" className="toggle" defaultChecked />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p className="font-bold text-sm">Audio Quality</p>
        <div className="flex flex-row justify-between w-full items-center">
          <p className="text-sm">Streaming quality</p>
          <select className="select w-full max-w-xs">
            <option>Low</option>
            <option>Normal</option>
            <option>High</option>
            <option>Very High</option>
          </select>
        </div>
        <div className="flex flex-row justify-between w-full items-center">
          <p className="text-sm">Download</p>
          <select className="select w-full max-w-xs">
            <option>Low</option>
            <option>Normal</option>
            <option>High</option>
            <option>Very High</option>
          </select>
        </div>
        <div className="flex flex-row justify-between w-full items-center">
          <p className="text-sm">
            Auto adjust quality - Recommended setting: On
          </p>
          <input type="checkbox" className="toggle" defaultChecked />
        </div>
        <div className="flex flex-row justify-between w-full items-center">
          <p className="text-sm">
            Normalize volume - Set the same volume level for all songs and
            podcast s
          </p>
          <input type="checkbox" className="toggle" defaultChecked />
        </div>
        <div className="flex flex-row justify-between w-full items-center">
          <p className="text-sm">
            Volume level - Adjust the volume for your environment. Loud may{" "}
            diminish audio quality. No effect on audio quality in Normal or
            Quiet
          </p>
          <select className="select w-full max-w-xs">
            <option>Low</option>
            <option>Normal</option>
            <option>High</option>
            <option>Very High</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col">
        <p className="font-bold text-sm">Your library</p>
        <div className="flex flex-row justify-between w-full items-center">
          <p className="text-sm">Show local files</p>
          <input type="checkbox" className="toggle" defaultChecked />
        </div>
      </div>
      <div className="flex flex-col">
        <p className="font-bold text-sm">Display</p>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row justify-between w-full items-center">
            <p className="text-sm">
              Show the now-playing panel on click of play
            </p>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div className="flex flex-row justify-between w-full items-center">
            <p className="text-sm">Show announcements about new releases</p>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div className="flex flex-row justify-between w-full items-center">
            <p className="text-sm">
              Show desktop notifications when the song changes
            </p>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div className="flex flex-row justify-between w-full items-center">
            <p className="text-sm">See what your friends are playing</p>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <p className="font-bold text-sm">Social</p>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row justify-between w-full items-center">
            <p className="text-sm">Publish my new playlists on my profile</p>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div className="flex flex-row justify-between w-full items-center">
            <p className="text-sm">Start a private session</p>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div className="flex flex-row justify-between w-full items-center">
            <p className="text-sm">Share my listening activity on Spotify</p>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div className="flex flex-row justify-between w-full items-center">
            <p className="text-sm">
              Show my recently played artists on my public profile
            </p>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <p className="font-bold text-sm">Playback</p>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row justify-between w-full items-center">
            <p className="text-sm">Crossfade songs</p>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div className="flex flex-row justify-between w-full items-center">
            <p className="text-sm">
              Automix - Allow seamless transition between songs on select
              playlists
            </p>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div className="flex flex-row justify-between w-full items-center">
            <p className="text-sm">
              Mono audio - Makes left and right speakers play the same audio
            </p>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div className="flex flex-row justify-between w-full items-center">
            <p className="text-sm">
              Show my recently played artists on my public profile
            </p>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
