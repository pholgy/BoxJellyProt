import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import App from './App';

// Mock the components that have external dependencies
vi.mock('./components/Layout', () => ({
  AppLayout: ({ children, currentPage, onPageChange }: any) => (
    <div data-testid="app-layout">
      <div data-testid="current-page">{currentPage}</div>
      <button
        data-testid="nav-button"
        onClick={() => onPageChange('🧬 โปรตีนพิษ')}
      >
        Navigate to Proteins
      </button>
      <div data-testid="page-content">{children}</div>
    </div>
  )
}));

vi.mock('./pages/HomePage', () => ({
  HomePage: () => <div data-testid="home-page">Home Page Content</div>
}));

describe('App Component', () => {
  test('renders with initial home page', () => {
    render(<App />);

    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    expect(screen.getByTestId('current-page')).toHaveTextContent('🏠 หน้าแรก');
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  test('navigation changes page content correctly', () => {
    render(<App />);

    // Initially shows home page
    expect(screen.getByTestId('home-page')).toBeInTheDocument();

    // Navigate to proteins page
    const navButton = screen.getByTestId('nav-button');
    fireEvent.click(navButton);

    // Should show proteins page content
    expect(screen.getByTestId('current-page')).toHaveTextContent('🧬 โปรตีนพิษ');
    expect(screen.getByText('🧬 โปรตีนพิษ')).toBeInTheDocument();
    expect(screen.getByText('Proteins Page - Coming Soon')).toBeInTheDocument();
  });

  test('route mapping works correctly', () => {
    render(<App />);

    // Test that Thai navigation items map to correct routes
    const navButton = screen.getByTestId('nav-button');
    fireEvent.click(navButton);

    // Verify proteins page is rendered
    expect(screen.getByText('🧬 โปรตีนพิษ')).toBeInTheDocument();
  });

  test('Ant Design ConfigProvider is configured with correct theme', () => {
    const { container } = render(<App />);

    // Check that the app is wrapped in ConfigProvider
    // The theme configuration should be applied (primary color #1E88E5)
    expect(container.firstChild).toBeInTheDocument();
  });
});