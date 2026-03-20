import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HomeSection } from './HomeSection';

describe('HomeSection', () => {
  it('renders the title', () => {
    render(<HomeSection title="Recently Played"><div /></HomeSection>);
    expect(screen.getByText('Recently Played')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <HomeSection title="Test">
        <span data-testid="child">hello</span>
      </HomeSection>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders title as an h2', () => {
    render(<HomeSection title="My Section"><div /></HomeSection>);
    expect(screen.getByRole('heading', { level: 2, name: 'My Section' })).toBeInTheDocument();
  });
});
