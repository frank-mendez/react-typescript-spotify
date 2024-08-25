import ReactCountryFlag from "react-country-flag";

const Profile = () => {
  const srcImage = "/assets/images/man.png";
  return (
    <div data-testid="profile-card-element" className="card-body">
      <div className="flex flex-row gap-4 items-center">
        <img
          data-testid="profile-img-element"
          className="mask mask-circle w-[300px]"
          src={srcImage}
        />
        <div className="flex flex-col justify-around align-middle gap-4">
          <p className="text-sm">Profile</p>
          <h1 className="font-bold text-6xl">John Doe</h1>
          <p className="text-sm">1K Followers</p>
          <ReactCountryFlag countryCode="PH" />
        </div>
      </div>
    </div>
  );
};

export default Profile;
