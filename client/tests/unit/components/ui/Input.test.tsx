import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../../../../src/components/ui/Input';

describe('Input component', () => {
  // ─── Rendering ────────────────────────────────────────────────────────────

  it('renders without required props', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Input label="Email address" />);
    expect(screen.getByText('Email address')).toBeInTheDocument();
  });

  it('does not render a label element when label prop is omitted', () => {
    render(<Input />);
    // The label element should not be present
    expect(screen.queryByText(/.+/)).toBeNull();
  });

  it('renders input with placeholder', () => {
    render(<Input placeholder="Enter your email" />);
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  });

  // ─── Error & helper text ─────────────────────────────────────────────────

  it('shows error message when error prop is set', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('does NOT show helperText when error is set', () => {
    render(<Input error="Oops" helperText="Helpful hint" />);
    expect(screen.queryByText('Helpful hint')).not.toBeInTheDocument();
  });

  it('shows helperText when no error prop', () => {
    render(<Input helperText="We will never share your email" />);
    expect(screen.getByText('We will never share your email')).toBeInTheDocument();
  });

  it('does not render helperText paragraph when helperText is omitted', () => {
    render(<Input />);
    expect(screen.queryByRole('paragraph')).toBeNull();
  });

  // ─── Icons ────────────────────────────────────────────────────────────────

  it('renders leftIcon when provided', () => {
    render(<Input leftIcon={<span data-testid="left-icon">L</span>} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders rightIcon when provided', () => {
    render(<Input rightIcon={<span data-testid="right-icon">R</span>} />);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('does not render leftIcon container when leftIcon is not provided', () => {
    render(<Input />);
    expect(screen.queryByTestId('left-icon')).toBeNull();
  });

  // ─── Event handling ───────────────────────────────────────────────────────

  it('calls onChange when user types', async () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'hello');
    expect(handleChange).toHaveBeenCalled();
  });

  // ─── Disabled ─────────────────────────────────────────────────────────────

  it('applies disabled attribute when disabled prop is true', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('is not disabled by default', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).not.toBeDisabled();
  });

  // ─── Forwarded ref ────────────────────────────────────────────────────────

  it('forwards ref so ref.current is the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('INPUT');
  });

  // ─── className prop ───────────────────────────────────────────────────────

  it('applies custom className to the input element', () => {
    render(<Input className="my-custom-class" />);
    expect(screen.getByRole('textbox').className).toContain('my-custom-class');
  });

  // ─── Focus / blur ─────────────────────────────────────────────────────────

  it('can receive focus', async () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    await userEvent.click(input);
    expect(input).toHaveFocus();
  });

  it('applies red error styling when error prop is set', () => {
    render(<Input error="Something went wrong" />);
    // The input class should include error-related classes
    expect(screen.getByRole('textbox').className).toContain('border-red-300');
  });

  it('calls the caller-supplied onFocus handler', () => {
    const onFocus = vi.fn();
    render(<Input onFocus={onFocus} />);
    fireEvent.focus(screen.getByRole('textbox'));
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('calls the caller-supplied onBlur handler', () => {
    const onBlur = vi.fn();
    render(<Input onBlur={onBlur} />);
    fireEvent.blur(screen.getByRole('textbox'));
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
