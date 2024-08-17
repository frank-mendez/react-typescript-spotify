import { useAuth } from "../context/AuthContext.tsx";

const Login = () => {
  const { login } = useAuth();
  return (
    <div
      data-testid="login-page-component"
      className="hero bg-base-200 min-h-screen"
    >
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Hello there</h1>
          <p className="py-6">
            Welcome to the Spotify Clone. Please login to continue. We will be
            using Spotify's PCKE method for authentication. This means we will
            not be storing your password or any sensitive information.
          </p>
          <button
            data-testid="login-button"
            onClick={login}
            className="btn btn-primary"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};
export default Login;
