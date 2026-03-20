export type FilterType = 'all' | 'playlists' | 'artists' | 'albums';

export interface LibraryItem {
  id: string;
  name: string;
  imageUrl: string | undefined;
  subtitle: string;
  type: 'playlist' | 'artist' | 'album';
  uri: string;
  isArtist: boolean;
}
