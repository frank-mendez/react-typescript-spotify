import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App component', () => {
    it('renders without crashing', () => {
        const { container } = render(<App />);
        expect(container).toBeInTheDocument();
    });
});