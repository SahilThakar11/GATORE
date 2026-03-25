import React from 'react';
import { render, screen } from '@testing-library/react';
import { DifficultyDots } from '../../../../src/components/searchGames/DifficultyDots';

describe('DifficultyDots', () => {
  it('renders 3 dot spans', () => {
    const { container } = render(<DifficultyDots difficulty="Medium" dots={2} />);
    const dots = container.querySelectorAll('span.rounded-full');
    expect(dots).toHaveLength(3);
  });

  it('renders the difficulty label when provided', () => {
    render(<DifficultyDots difficulty="Hard" dots={3} />);
    expect(screen.getByText('Hard')).toBeInTheDocument();
  });

  it('does not render a difficulty label when difficulty is null', () => {
    render(<DifficultyDots difficulty={null} dots={2} />);
    expect(screen.queryByText('Medium')).not.toBeInTheDocument();
    expect(screen.queryByText('Hard')).not.toBeInTheDocument();
  });

  it('fills the correct number of dots based on dots prop', () => {
    const filledClass = 'bg-warm-700';
    const emptyClass = 'bg-warm-300';
    const { container } = render(<DifficultyDots difficulty="Easy" dots={1} />);
    const spans = container.querySelectorAll('span.rounded-full');
    expect(spans[0].className).toContain(filledClass);
    expect(spans[1].className).toContain(emptyClass);
    expect(spans[2].className).toContain(emptyClass);
  });

  it('fills all 3 dots when dots >= 3', () => {
    const filledClass = 'bg-warm-700';
    const { container } = render(<DifficultyDots difficulty="Expert" dots={5} />);
    const spans = container.querySelectorAll('span.rounded-full');
    spans.forEach((span) => {
      expect(span.className).toContain(filledClass);
    });
  });

  it('fills no dots when dots is 0', () => {
    const emptyClass = 'bg-warm-300';
    const { container } = render(<DifficultyDots difficulty="Easy" dots={0} />);
    const spans = container.querySelectorAll('span.rounded-full');
    spans.forEach((span) => {
      expect(span.className).toContain(emptyClass);
    });
  });

  it('uses custom filledClass and emptyClass when provided', () => {
    const { container } = render(
      <DifficultyDots difficulty="Medium" dots={2} filledClass="bg-blue-500" emptyClass="bg-gray-200" />,
    );
    const spans = container.querySelectorAll('span.rounded-full');
    expect(spans[0].className).toContain('bg-blue-500');
    expect(spans[2].className).toContain('bg-gray-200');
  });

  it('applies isTextWhite class when isTextWhite=true', () => {
    render(<DifficultyDots difficulty="Medium" dots={2} isTextWhite />);
    expect(screen.getByText('Medium').className).toContain('text-white');
  });

  it('applies text-gray-800 class when isTextWhite is not set', () => {
    render(<DifficultyDots difficulty="Medium" dots={2} />);
    expect(screen.getByText('Medium').className).toContain('text-gray-800');
  });
});
