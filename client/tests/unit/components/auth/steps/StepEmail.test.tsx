import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepEmail } from '../../../../../src/components/auth/steps/StepEmail';
import type { AuthFormData } from '../../../../../src/hooks/useAuthModal';

// GoogleAuthButton uses useGoogleLogin which requires the Google OAuth provider.
// We stub it out so component tests stay isolated from external SDKs.
vi.mock('../../../../../src/components/auth/GoogleAuthButton', () => ({
  GoogleAuthButton: ({ onSuccess }: { onSuccess: (u: unknown) => void }) => (
    <button type="button" onClick={() => onSuccess({ email: 'g@google.com' })}>
      Continue with Google
    </button>
  ),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildProps(overrides: Partial<Parameters<typeof StepEmail>[0]> = {}) {
  return {
    formData: { email: '' } as AuthFormData,
    updateData: vi.fn(),
    onContinue: vi.fn(),
    onBack: vi.fn(),
    onGoogleSuccess: vi.fn(),
    loading: false,
    onSwitchToSignIn: vi.fn(),
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('StepEmail component', () => {
  it('renders the email input field', () => {
    render(<StepEmail {...buildProps()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders the heading text', () => {
    render(<StepEmail {...buildProps()} />);
    expect(screen.getByText(/let's get started/i)).toBeInTheDocument();
  });

  it('renders the Continue and Back buttons', () => {
    render(<StepEmail {...buildProps()} />);
    expect(screen.getByRole('button', { name: "Continue" })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('renders the Google sign-in button', () => {
    render(<StepEmail {...buildProps()} />);
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
  });

  // ─── Validation: Continue button state ──────────────────────────────────
  it('disables Continue when email is empty', () => {
    render(<StepEmail {...buildProps({ formData: { email: '' } as AuthFormData })} />);
    expect(screen.getByRole('button', { name: "Continue" })).toBeDisabled();
  });

  it('disables Continue when email is invalid', () => {
    render(<StepEmail {...buildProps({ formData: { email: 'notanemail' } as AuthFormData })} />);
    expect(screen.getByRole('button', { name: "Continue" })).toBeDisabled();
  });

  it('enables Continue when email is valid', () => {
    render(
      <StepEmail {...buildProps({ formData: { email: 'user@example.com' } as AuthFormData })} />,
    );
    expect(screen.getByRole('button', { name: "Continue" })).not.toBeDisabled();
  });

  // ─── Callbacks ────────────────────────────────────────────────────────────
  it('calls updateData when the user types in the email field', async () => {
    const updateData = vi.fn();
    render(<StepEmail {...buildProps({ updateData })} />);
    await userEvent.type(screen.getByRole('textbox'), 'a');
    expect(updateData).toHaveBeenCalled();
  });

  it('calls onContinue when the Continue button is clicked with a valid email', async () => {
    const onContinue = vi.fn();
    render(
      <StepEmail
        {...buildProps({ formData: { email: 'user@example.com' } as AuthFormData, onContinue })}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: "Continue" }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when the Back button is clicked', async () => {
    const onBack = vi.fn();
    render(<StepEmail {...buildProps({ onBack })} />);
    await userEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('calls onSwitchToSignIn when "Sign in" link is clicked', async () => {
    const onSwitchToSignIn = vi.fn();
    render(<StepEmail {...buildProps({ onSwitchToSignIn })} />);
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(onSwitchToSignIn).toHaveBeenCalledTimes(1);
  });

  it('calls onGoogleSuccess when Google button is clicked', async () => {
    const onGoogleSuccess = vi.fn();
    render(<StepEmail {...buildProps({ onGoogleSuccess })} />);
    await userEvent.click(screen.getByRole('button', { name: /continue with google/i }));
    expect(onGoogleSuccess).toHaveBeenCalledTimes(1);
  });

  // ─── Loading state ────────────────────────────────────────────────────────
  it('disables the email input while loading', () => {
    render(
      <StepEmail
        {...buildProps({
          loading: true,
          formData: { email: 'user@example.com' } as AuthFormData,
        })}
      />,
    );
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('disables the Back button while loading', () => {
    render(<StepEmail {...buildProps({ loading: true })} />);
    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled();
  });

  // ─── Keyboard interaction ─────────────────────────────────────────────────
  it('calls onContinue when Enter is pressed with a valid email', async () => {
    const onContinue = vi.fn();
    render(
      <StepEmail
        {...buildProps({
          formData: { email: 'user@example.com' } as AuthFormData,
          onContinue,
        })}
      />,
    );
    await userEvent.type(screen.getByRole('textbox'), '{Enter}');
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('does not call onContinue when Enter is pressed with an invalid email', async () => {
    const onContinue = vi.fn();
    render(
      <StepEmail
        {...buildProps({ formData: { email: 'bademail' } as AuthFormData, onContinue })}
      />,
    );
    await userEvent.type(screen.getByRole('textbox'), '{Enter}');
    expect(onContinue).not.toHaveBeenCalled();
  });
});
