import type { ExternalUrls, Track } from './spotify';

export interface Device {
  id?: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent?: number;
}

interface PlaybackContext {
  type: 'artist' | 'playlist' | 'album' | 'show';
  href: string;
  external_urls: ExternalUrls;
  uri: string;
}

export interface PlaybackState {
  device: Device;
  repeat_state: 'off' | 'track' | 'context';
  shuffle_state: boolean;
  context?: PlaybackContext;
  timestamp: number;
  progress_ms?: number;
  is_playing: boolean;
  item?: Track;
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown';
  actions: {
    interrupting_playback?: boolean;
    pausing?: boolean;
    resuming?: boolean;
    seeking?: boolean;
    skipping_next?: boolean;
    skipping_prev?: boolean;
    toggling_repeat_context?: boolean;
    toggling_shuffle?: boolean;
    toggling_repeat_track?: boolean;
    transferring_playback?: boolean;
  };
}

export interface CurrentlyPlaying {
  device: Device;
  repeat_state: 'off' | 'track' | 'context';
  shuffle_state: boolean;
  context?: PlaybackContext;
  timestamp: number;
  progress_ms?: number;
  is_playing: boolean;
  item?: Track;
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown';
  actions: {
    disallows: {
      interrupting_playback?: boolean;
      pausing?: boolean;
      resuming?: boolean;
      seeking?: boolean;
      skipping_next?: boolean;
      skipping_prev?: boolean;
      toggling_repeat_context?: boolean;
      toggling_shuffle?: boolean;
      toggling_repeat_track?: boolean;
      transferring_playback?: boolean;
    };
  };
}
