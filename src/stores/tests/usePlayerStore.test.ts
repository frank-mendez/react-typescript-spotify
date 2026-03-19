import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlayerStore } from '../usePlayerStore';

describe('usePlayerStore', () => {
  beforeEach(() => {
    // Reset Zustand singleton state between tests
    usePlayerStore.setState({ deviceId: null });
  });

  it('initial deviceId is null', () => {
    const { result } = renderHook(() => usePlayerStore());
    expect(result.current.deviceId).toBeNull();
  });

  it('setDeviceId updates deviceId', () => {
    const { result } = renderHook(() => usePlayerStore());

    act(() => {
      result.current.setDeviceId('abc-123');
    });

    expect(result.current.deviceId).toBe('abc-123');
  });

  it('setDeviceId can reset deviceId to null', () => {
    const { result } = renderHook(() => usePlayerStore());

    act(() => {
      result.current.setDeviceId('abc-123');
    });
    act(() => {
      result.current.setDeviceId(null);
    });

    expect(result.current.deviceId).toBeNull();
  });
});
