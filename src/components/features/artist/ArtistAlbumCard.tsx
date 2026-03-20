import { useNavigate } from 'react-router-dom';
import type { Album } from '../../../types/spotify';

interface ArtistAlbumCardProps {
  album: Pick<Album, 'id' | 'name' | 'images' | 'release_date'>;
}

export function ArtistAlbumCard({ album }: ArtistAlbumCardProps) {
  const navigate = useNavigate();
  const coverUrl = album.images?.[0]?.url;
  const releaseYear = album.release_date ? album.release_date.slice(0, 4) : null;

  const handleNavigate = () => navigate(`/album/${album.id}`);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNavigate(); }
  };

  return (
    <div
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={album.name}
      className="w-40 shrink-0 cursor-pointer group"
      data-testid={`album-card-${album.id}`}
    >
      {coverUrl ? (
        <img src={coverUrl} alt={album.name} className="w-full aspect-square object-cover rounded mb-2" />
      ) : (
        <div className="w-full aspect-square bg-surface rounded mb-2" />
      )}
      <p className="text-text-primary text-sm font-bold truncate">{album.name}</p>
      {releaseYear && <p className="text-text-muted text-xs mt-0.5">{releaseYear}</p>}
    </div>
  );
}
