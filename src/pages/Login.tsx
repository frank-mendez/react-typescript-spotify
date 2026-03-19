import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { Music } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-8" data-testid="login-page-component">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
          <Music className="w-8 h-8 text-bg" />
        </div>
        <div className="text-center">
          <h1 className="text-text-primary text-3xl font-bold">Spotify</h1>
          <p className="text-text-muted text-sm mt-1">Music for everyone.</p>
        </div>
      </div>
      <Button
        onClick={login}
        data-testid="login-button"
        className="bg-accent hover:bg-accent-muted text-bg font-semibold px-10 py-3 rounded-full text-sm"
      >
        Log in with Spotify
      </Button>
    </div>
  );
};

export default Login;
