// From profile-interface.ts
export interface ExternalUrls {
  spotify: string;
}

export interface Image {
  url: string;
  height?: number;
  width?: number;
}

export interface Followers {
  href?: string;
  total: number;
}

export interface ProfileInterface {
  id: string;
  display_name: string;
  email: string;
  external_urls: ExternalUrls;
  followers: Followers;
  href: string;
  images: Image[];
  type: string;
  uri: string;
  country?: string;
  product?: string;
  explicit_content?: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
}

// Artist
export interface Artist {
  external_urls: ExternalUrls;
  followers?: Followers;
  genres?: string[];
  href: string;
  id: string;
  images?: Image[];
  name: string;
  popularity?: number;
  type: 'artist';
  uri: string;
}

export interface ArtistTopTracks {
  tracks: Track[];
}

export interface ArtistAlbums {
  href: string;
  limit: number;
  next?: string;
  offset: number;
  previous?: string;
  total: number;
  items: Album[];
}

// Album
export interface Album {
  album_type: 'album' | 'single' | 'compilation';
  total_tracks: number;
  available_markets?: string[];
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: 'year' | 'month' | 'day';
  restrictions?: { reason: 'market' | 'product' | 'explicit' };
  type: 'album';
  uri: string;
  artists: Artist[];
  tracks?: {
    href: string;
    limit: number;
    next?: string;
    offset: number;
    previous?: string;
    total: number;
    items: Track[];
  };
  copyrights?: { text: string; type: 'C' | 'P' }[];
  external_ids?: Record<string, string>;
  genres?: string[];
  label?: string;
  popularity?: number;
}

// Track
export interface Track {
  album?: Album;
  artists: Artist[];
  available_markets?: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids?: Record<string, string>;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  is_playable?: boolean;
  linked_from?: {
    external_urls: ExternalUrls;
    href: string;
    id: string;
    type: 'track';
    uri: string;
  };
  restrictions?: { reason: 'market' | 'product' | 'explicit' };
  name: string;
  popularity: number;
  preview_url?: string;
  track_number: number;
  type: 'track';
  uri: string;
  is_local: boolean;
}

export interface SavedTrack {
  added_at: string;
  track: Track;
}

export interface SavedAlbum {
  added_at: string;
  album: Album;
}

// Playlist
export interface Playlist {
  collaborative: boolean;
  description?: string;
  external_urls: ExternalUrls;
  followers: Followers;
  href: string;
  id: string;
  images: Image[];
  name: string;
  owner: {
    external_urls: ExternalUrls;
    followers?: Followers;
    href: string;
    id: string;
    type: 'user';
    uri: string;
    display_name?: string;
  };
  public?: boolean;
  snapshot_id: string;
  tracks: {
    href: string;
    total: number;
    items?: PlaylistTrack[];
  };
  items?: PaginatedResponse<PlaylistItem>;
  type: 'playlist';
  uri: string;
}

export interface PlaylistTrack {
  added_at: string;
  added_by: {
    external_urls: ExternalUrls;
    followers?: Followers;
    href: string;
    id: string;
    type: 'user';
    uri: string;
  };
  is_local: boolean;
  track: Track | null;
}

export interface Episode {
  id: string;
  name: string;
  type: 'episode';
  uri: string;
}

export interface PlaylistItem {
  added_at: string;
  added_by: {
    external_urls: ExternalUrls;
    href: string;
    id: string;
    type: 'user';
    uri: string;
  };
  is_local: boolean;
  item: Track | Episode | null;
}

// Search
export interface SearchResult {
  artists?: PaginatedResponse<Artist>;
  albums?: PaginatedResponse<Album>;
  tracks?: PaginatedResponse<Track>;
  playlists?: PaginatedResponse<Playlist>;
}

// Pagination
export interface PaginatedResponse<T> {
  href: string;
  limit: number;
  next?: string;
  offset: number;
  previous?: string;
  total: number;
  items: T[];
}

export type UserSavedAlbums = PaginatedResponse<SavedAlbum>;
export type UserSavedTracks = PaginatedResponse<SavedTrack>;
export type UserPlaylists = PaginatedResponse<Playlist>;

// Browse
export interface FeaturedPlaylists {
  message?: string;
  playlists: PaginatedResponse<Playlist>;
}

export interface NewReleases {
  albums: PaginatedResponse<Album>;
}

export interface Category {
  href: string;
  icons: Image[];
  id: string;
  name: string;
}

export type Categories = PaginatedResponse<Category>;

// Recommendations
export interface RecommendationSeed {
  afterFilteringSize: number;
  afterRelinkingSize: number;
  href?: string;
  id: string;
  initialPoolSize: number;
  type: 'artist' | 'track' | 'genre';
}

export interface Recommendations {
  seeds: RecommendationSeed[];
  tracks: Track[];
}

export interface AudioFeatures {
  acousticness: number;
  analysis_url: string;
  danceability: number;
  duration_ms: number;
  energy: number;
  id: string;
  instrumentalness: number;
  key: number;
  liveness: number;
  loudness: number;
  mode: number;
  speechiness: number;
  tempo: number;
  time_signature: number;
  track_href: string;
  type: 'audio_features';
  uri: string;
  valence: number;
}
