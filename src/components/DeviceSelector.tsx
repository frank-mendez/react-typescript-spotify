import React from 'react';
import { useAvailableDevices } from '../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../hooks/useSpotifyMutations';

const DeviceSelector: React.FC = () => {
  const { data: devices, isLoading, error } = useAvailableDevices();
  const { transferPlayback } = usePlaybackControls();

  const handleDeviceSelect = async (deviceId: string) => {
    try {
      await transferPlayback.mutateAsync({ 
        deviceIds: [deviceId], 
        play: true 
      });
    } catch (error) {
      console.error('Failed to transfer playback:', error);
    }
  };

  if (isLoading) return <div className="text-sm text-gray-500">Loading devices...</div>;
  if (error) return <div className="text-sm text-red-500">Error loading devices</div>;
  if (!devices?.devices || devices.devices.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-yellow-800 mb-2">🎵 No Active Devices Found</h3>
        <p className="text-yellow-700 text-sm mb-3">
          To control playback, you need an active Spotify device:
        </p>
        <ul className="text-yellow-700 text-sm space-y-1 mb-3">
          <li>• Open <strong>Spotify Desktop App</strong> and start playing music</li>
          <li>• Use <strong>Spotify Mobile App</strong> with active playback</li>
          <li>• Open <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer" className="underline">Spotify Web Player</a></li>
        </ul>
        <p className="text-yellow-600 text-xs">
          Once a device is active, refresh this page or try the controls again.
        </p>
      </div>
    );
  }

  const activeDevice = devices.devices.find(device => device.is_active);
  const inactiveDevices = devices.devices.filter(device => !device.is_active);

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-green-800 mb-2">🎵 Spotify Devices</h3>
      
      {activeDevice && (
        <div className="mb-3">
          <div className="flex items-center space-x-2 p-2 bg-green-100 rounded">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="font-medium text-green-800">{activeDevice.name}</span>
            <span className="text-green-600 text-sm">({activeDevice.type})</span>
            <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded">ACTIVE</span>
          </div>
        </div>
      )}

      {inactiveDevices.length > 0 && (
        <div>
          <p className="text-green-700 text-sm mb-2">Available devices:</p>
          <div className="space-y-1">
            {inactiveDevices.map((device) => (
              <button
                key={device.id}
                onClick={() => handleDeviceSelect(device.id!)}
                className="flex items-center space-x-2 p-2 w-full text-left hover:bg-green-100 rounded transition-colors"
                disabled={transferPlayback.isPending}
              >
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="text-green-800">{device.name}</span>
                <span className="text-green-600 text-sm">({device.type})</span>
                {transferPlayback.isPending && (
                  <span className="text-xs text-green-600">Connecting...</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceSelector;
