import ReactCountryFlag from "react-country-flag";

const Profile = () => {
  const srcImage = "/assets/images/post_malone.jpg";
  return (
    <div data-testid="profile-card-element" className="card-body">
      <div className="flex flex-row gap-4 items-center">
        <img
          alt="Profile"
          data-testid="profile-img-element"
          className="mask mask-circle w-[300px]"
          src={srcImage}
        />
        <div className="flex flex-col justify-around align-middle gap-4">
          <p className="text-sm">Profile</p>
          <h1 className="font-bold text-6xl">Post Malone</h1>
          <p className="text-sm">
            50 Public Playlist - 1 Following - 5M Followers
          </p>
          <ReactCountryFlag countryCode="US" />
        </div>
      </div>
    </div>
  );
};

export default Profile;
