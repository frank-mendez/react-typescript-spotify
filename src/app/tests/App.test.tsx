import { vi, describe, it, expect } from 'vitest';

// Must stub env before App module is evaluated because it throws at module scope
vi.stubEnv('VITE_CLIENT_ID', 'test-client-id');
vi.stubEnv('VITE_REDIRECT_URI', 'http://localhost:5173/');

// jsdom does not implement matchMedia — stub it before App module loads
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('App', () => {
  it('renders without crashing', async () => {
    const { default: App } = await import('../App');
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
