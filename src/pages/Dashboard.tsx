import Auth from "../components/Auth.tsx";
import { getUserData } from "../api/auth/service/auth.service.ts";

const Dashboard = () => {
  const accessToken = localStorage.getItem("access_token");
  console.log("Dashboard accessToken", accessToken);
  const userData = getUserData(accessToken ?? "");
  console.log("Dashboard userData", userData);
  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Hello there</h1>
          <p className="py-6">
            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
            excepturi exercitationem quasi. In deleniti eaque aut repudiandae et
            a id nisi.
          </p>
          <Auth />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
