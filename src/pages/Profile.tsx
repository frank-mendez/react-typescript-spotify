import ReactCountryFlag from "react-country-flag";
import { useAuth } from "../context/AuthContext.tsx";
import { useProfileQuery } from "../api/user";

const Profile = () => {
  const { accessToken } = useAuth();
  const { data, isPending } = useProfileQuery(accessToken ?? "");
  const srcImage = "/assets/images/man.png";
  return (
    <div className={`card-body ${isPending ? "skeleton" : ""}`}>
      {!isPending && data && (
        <div className="flex flex-row gap-4 items-center">
          <img className="mask mask-circle w-[300px]" src={srcImage} />
          <div className="flex flex-col justify-around align-middle gap-4">
            <p className="text-sm">Profile</p>
            <h1 className="font-bold text-6xl">
              {data?.display_name ?? "John Doe"}
            </h1>
            <p className="text-sm">{data?.followers?.total ?? 100} Followers</p>
            <ReactCountryFlag countryCode={data.country} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
