import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../../../src/components/ui/Button';

describe('Button component', () => {
  // ─── Rendering ────────────────────────────────────────────────────────────
  it('renders its children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('is a <button> element', () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // ─── Default props ────────────────────────────────────────────────────────
  it('applies teal background by default (primary variant)', () => {
    render(<Button>Primary</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-teal-500');
  });

  it('applies medium padding by default (md size)', () => {
    render(<Button>Medium</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('px-6');
    expect(btn.className).toContain('py-3');
  });

  // ─── Variants ─────────────────────────────────────────────────────────────
  it('applies secondary styles for variant="secondary"', () => {
    render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button').className).toContain('bg-amber-900');
  });

  it('applies ghost styles for variant="ghost"', () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button').className).toContain('text-gray-600');
  });

  // ─── Size prop ─────────────────────────────────────────────────────────────
  it('applies smaller padding for size="sm"', () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button').className).toContain('px-3');
  });

  it('applies larger padding for size="lg"', () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button').className).toContain('px-8');
  });

  // ─── fullWidth ────────────────────────────────────────────────────────────
  it('adds w-full class when fullWidth=true', () => {
    render(<Button fullWidth>Full</Button>);
    expect(screen.getByRole('button').className).toContain('w-full');
  });

  it('does not add w-full class when fullWidth=false (default)', () => {
    render(<Button>Normal</Button>);
    expect(screen.getByRole('button').className).not.toContain('w-full');
  });

  // ─── Disabled state ───────────────────────────────────────────────────────
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies cursor-not-allowed styles when disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button').className).toContain('cursor-not-allowed');
  });

  it('does not apply cursor-not-allowed when enabled', () => {
    render(<Button>Enabled</Button>);
    expect(screen.getByRole('button').className).not.toContain('cursor-not-allowed');
  });

  // ─── Event handling ───────────────────────────────────────────────────────
  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>No Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  // ─── className merging ────────────────────────────────────────────────────
  it('merges a custom className with the default styles', () => {
    render(<Button className="my-custom-class">Custom</Button>);
    expect(screen.getByRole('button').className).toContain('my-custom-class');
  });
});
