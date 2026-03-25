import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameCard } from '../../../../src/components/searchGames/GameCard';
import type { BGGGame } from '../../../../src/hooks/useBGG';

// ─── Mocks ────────────────────────────────────────────────────────────────────

// ResizeObserver is not available in jsdom — provide a no-op stub.
vi.stubGlobal('ResizeObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
});

// DifficultyDots is purely visual; stub it so tests focus on GameCard logic.
vi.mock('../../../../src/components/searchGames/DifficultyDots', () => ({
  DifficultyDots: () => <span data-testid="difficulty-dots" />,
}));

// TextButton renders a real <button>; keep it real so click events work,
// but mock the module to avoid any potential side-effects from internal state.
vi.mock('../../../../src/components/ui/TextButton', () => ({
  TextButton: ({
    label,
    onClick,
  }: {
    label: string;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  ),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildGame(overrides: Partial<BGGGame> = {}): BGGGame {
  return {
    id: '1',
    name: 'Catan',
    image: '',
    description: 'A classic trading game.',
    players: '3-4',
    duration: '60-120 min',
    age: '10+',
    rating: 7.2,
    difficulty: 'Medium',
    weightDots: 2,
    categories: ['Strategy', 'Family'],
    designer: 'Klaus Teuber',
    publisher: 'Kosmos',
    ...overrides,
  };
}

interface RenderProps {
  game?: BGGGame;
  onClick?: (game: BGGGame) => void;
  onViewDetails?: (game: BGGGame) => void;
  selected?: boolean;
  selectable?: boolean;
}

function renderCard(props: RenderProps = {}) {
  const onClick = props.onClick ?? vi.fn();
  const onViewDetails = props.onViewDetails ?? vi.fn();
  const game = props.game ?? buildGame();

  render(
    <GameCard
      game={game}
      onClick={onClick}
      onViewDetails={onViewDetails}
      selected={props.selected}
      selectable={props.selectable}
    />,
  );

  return { onClick, onViewDetails, game };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GameCard component', () => {
  // ─── Content rendering ────────────────────────────────────────────────────

  it('renders the game name', () => {
    renderCard({ game: buildGame({ name: 'Pandemic' }) });
    expect(screen.getByText('Pandemic')).toBeInTheDocument();
  });

  it('renders the players text', () => {
    renderCard({ game: buildGame({ players: '2-5' }) });
    expect(screen.getByText('2-5 players')).toBeInTheDocument();
  });

  it('renders the duration text', () => {
    renderCard({ game: buildGame({ duration: '45 min' }) });
    expect(screen.getByText('45 min')).toBeInTheDocument();
  });

  it('renders the first category when categories are present', () => {
    renderCard({ game: buildGame({ categories: ['Cooperative', 'Thematic'] }) });
    expect(screen.getByText('Cooperative')).toBeInTheDocument();
  });

  it('does not render a category tag when categories array is empty', () => {
    renderCard({ game: buildGame({ categories: [] }) });
    // No category chip should appear for "Strategy" or any default value
    expect(screen.queryByText('Strategy')).not.toBeInTheDocument();
  });

  // ─── Image / fallback ────────────────────────────────────────────────────

  it('shows "No image" text when game.image is falsy', () => {
    renderCard({ game: buildGame({ image: '' }) });
    expect(screen.getByText('No image')).toBeInTheDocument();
  });

  it('renders an <img> with alt equal to game.name when game.image is truthy', () => {
    renderCard({
      game: buildGame({ name: 'Ticket to Ride', image: 'https://example.com/ttr.jpg' }),
    });
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'Ticket to Ride');
  });

  it('does not render an <img> when game.image is falsy', () => {
    renderCard({ game: buildGame({ image: '' }) });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  // ─── Interactions ─────────────────────────────────────────────────────────

  it('calls onClick with the game object when the main button is clicked', async () => {
    const onClick = vi.fn();
    const game = buildGame({ name: 'Azul' });
    renderCard({ game, onClick });
    // The main button contains the game info; pressing it should fire onClick
    fireEvent.click(screen.getByRole('button', { name: /azul/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(game);
  });

  it('calls onViewDetails with the game object when "View game details" is clicked', async () => {
    const onViewDetails = vi.fn();
    const game = buildGame();
    renderCard({ game, onViewDetails });
    await userEvent.click(screen.getByRole('button', { name: /view game details/i }));
    expect(onViewDetails).toHaveBeenCalledTimes(1);
    expect(onViewDetails).toHaveBeenCalledWith(game);
  });

  // ─── Selected state ───────────────────────────────────────────────────────

  it('sets aria-pressed to true on the main button when selected=true', () => {
    renderCard({ selected: true });
    // The main button (not the view-details one) has aria-pressed
    const pressedButton = screen.getByRole('button', { pressed: true });
    expect(pressedButton).toBeInTheDocument();
  });

  it('does not set aria-pressed to true when selected is not set', () => {
    renderCard();
    expect(screen.queryByRole('button', { pressed: true })).not.toBeInTheDocument();
  });

  it('adds teal border class when selected=true', () => {
    const { container } = render(
      <GameCard
        game={buildGame()}
        onClick={vi.fn()}
        onViewDetails={vi.fn()}
        selected={true}
      />,
    );
    // The outer wrapper div should contain the teal border class
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain('border-teal-500');
  });
});
