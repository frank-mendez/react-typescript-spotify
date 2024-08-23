import { useContentStore } from "../stores/useContentStore.ts";
import { useProfileQuery } from "../api/user";
import { useAuth } from "../context/AuthContext.tsx";
import { MainContent as MC } from "../data-objects/enum";
import ReactCountryFlag from "react-country-flag";

const MainContent = () => {
  const { currentContent } = useContentStore();
  const { accessToken } = useAuth();
  const { data, isPending } = useProfileQuery(accessToken ?? "");
  return (
    <div
      data-testid="main-content-element"
      className="card bg-base-300 my-10 basis-1/2 shadow-xl"
    >
      {currentContent === MC.PROFILE && (
        <div className={`card-body ${isPending ? "skeleton" : ""}`}>
          {!isPending && data && (
            <div className="flex flex-row gap-4 items-center">
              <img
                className="mask mask-circle w-[300px]"
                src={data.images[1].url}
              />
              <div className="flex flex-col justify-around align-middle gap-4">
                <p className="text-sm">Profile</p>
                <h1 className="font-bold text-6xl">{data.display_name}</h1>
                <p className="text-sm">{data.followers.total} Followers</p>
                <ReactCountryFlag countryCode={data.country} />
              </div>
            </div>
          )}
          <iframe
            className="rounded-xl w-full"
            src="https://open.spotify.com/embed/playlist/37i9dQZEVXbNBz9cRCSFkY?utm_source=generator&theme=0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default MainContent;
