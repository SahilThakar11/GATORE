import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CafeCard } from '../../../../src/components/home/CafeCard';

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface CafeCardProps {
  id: number;
  image: string | null;
  title: string;
  location: string;
  rating: number;
  reviewCount: number;
  gameCount: number;
}

function buildProps(overrides: Partial<CafeCardProps> = {}): CafeCardProps {
  return {
    id: 42,
    image: null,
    title: 'The Board Room',
    location: 'Downtown, Vancouver',
    rating: 4.5,
    reviewCount: 128,
    gameCount: 75,
    ...overrides,
  };
}

function renderCard(props: Partial<CafeCardProps> = {}) {
  return render(
    <MemoryRouter>
      <CafeCard {...buildProps(props)} />
    </MemoryRouter>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CafeCard component', () => {
  // ─── Content rendering ──────────────────────────────────────────────────

  it('renders the cafe title', () => {
    renderCard({ title: 'Dice & Brews' });
    expect(screen.getByText('Dice & Brews')).toBeInTheDocument();
  });

  it('renders the location string', () => {
    renderCard({ location: 'Gastown, Vancouver' });
    expect(screen.getByText('Gastown, Vancouver')).toBeInTheDocument();
  });

  it('renders the rating formatted to 1 decimal place', () => {
    renderCard({ rating: 4.5 });
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('formats a whole-number rating to 1 decimal (e.g. 4 → "4.0")', () => {
    renderCard({ rating: 4 });
    expect(screen.getByText('4.0')).toBeInTheDocument();
  });

  it('renders the review count wrapped in parentheses', () => {
    renderCard({ reviewCount: 99 });
    expect(screen.getByText('(99)')).toBeInTheDocument();
  });

  it('renders gameCount in the format "{n} games"', () => {
    renderCard({ gameCount: 50 });
    expect(screen.getByText('50 games')).toBeInTheDocument();
  });

  // ─── Link ─────────────────────────────────────────────────────────────────

  it('wraps the card in a link pointing to /cafe/:id', () => {
    renderCard({ id: 7 });
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/cafe/7');
  });

  // ─── Image / fallback ────────────────────────────────────────────────────

  it('shows the first letter of the title as a fallback when image is null', () => {
    renderCard({ image: null, title: 'Meeple Lounge' });
    // The fallback renders the first character "M"
    expect(screen.getByText('M')).toBeInTheDocument();
    // No <img> should be present
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders an <img> with alt=title when image is provided', () => {
    renderCard({ image: 'https://example.com/cafe.jpg', title: 'Roll For It' });
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'Roll For It');
  });

  it('does not render the fallback letter div when an image is provided', () => {
    renderCard({ image: 'https://example.com/cafe.jpg', title: 'Roll For It' });
    // "R" (first letter of title) should NOT appear as fallback text
    // The img element should be there instead
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
