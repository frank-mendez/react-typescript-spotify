import { useCurrentUserProfile } from '../hooks/useSpotifyQueries';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { Badge } from '../components/ui/badge';

const Profile = () => {
  const { data: profile, isLoading, error, refetch } = useCurrentUserProfile();

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col gap-6" data-testid="profile-card-element">
        <div className="flex items-end gap-6" data-testid="profile-page">
          <Skeleton className="w-36 h-36 rounded-full" data-testid="profile-img-element" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Could not load profile" onRetry={() => refetch()} />;
  }

  if (!profile) return null;

  const avatarUrl = profile.images?.[0]?.url;
  const initials = profile.display_name?.slice(0, 2).toUpperCase() ?? 'U';

  return (
    <div className="p-8" data-testid="profile-card-element">
      <div className="flex items-end gap-6 mb-8" data-testid="profile-page">
        <Avatar className="w-36 h-36" data-testid="profile-img-element">
          <AvatarImage src={avatarUrl} alt={profile.display_name} />
          <AvatarFallback className="bg-accent text-bg text-4xl font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <span className="text-text-muted text-xs font-semibold uppercase">Profile</span>
          <h1 className="text-text-primary text-5xl font-black">{profile.display_name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-text-muted text-sm">
              {profile.followers?.total?.toLocaleString()} Followers
            </span>
            {profile.product && (
              <Badge variant="outline" className="border-border text-text-muted capitalize text-xs">
                {profile.product}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
