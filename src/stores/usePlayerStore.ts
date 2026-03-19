import { create } from 'zustand';

interface PlayerStore {
  deviceId: string | null;
  setDeviceId: (id: string | null) => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  deviceId: null,
  setDeviceId: (id) => set({ deviceId: id }),
}));
