import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepOTPVerify } from '../../../../../src/components/auth/steps/StepOTPVerify';
import type { AuthFormData } from '../../../../../src/hooks/useAuthModal';

// ─── Mocks ────────────────────────────────────────────────────────────────────

// PrimaryButton and SecondaryButton have internal hover/focus state that is
// irrelevant here. Stub them to plain <button> elements so tests are stable.
vi.mock('../../../../../src/components/ui/PrimaryButton', () => ({
  PrimaryButton: ({
    label,
    onClick,
    disabled,
  }: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    isLoading?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {label}
    </button>
  ),
}));

vi.mock('../../../../../src/components/ui/SecondaryButton', () => ({
  SecondaryButton: ({
    label,
    onClick,
    disabled,
  }: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {label}
    </button>
  ),
}));

// ─── Fixture data ─────────────────────────────────────────────────────────────

const mockFormData: AuthFormData = {
  email: 'test@example.com',
  otp: ['', '', '', '', '', ''],
  password: '',
  confirmPassword: '',
  name: '',
  phone: '',
  gameTypes: [],
  groupSize: 'any',
  complexity: 'any',
  isGoogleAuth: false,
};

const completedOtp: AuthFormData = {
  ...mockFormData,
  otp: ['1', '2', '3', '4', '5', '6'],
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildProps(overrides: Partial<Parameters<typeof StepOTPVerify>[0]> = {}) {
  return {
    formData: mockFormData,
    updateData: vi.fn(),
    onContinue: vi.fn(),
    onBack: vi.fn(),
    onResend: vi.fn(),
    loading: false,
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('StepOTPVerify component', () => {
  // ─── Rendering ──────────────────────────────────────────────────────────

  it('renders the heading "Check your email"', () => {
    render(<StepOTPVerify {...buildProps()} />);
    expect(screen.getByText('Check your email')).toBeInTheDocument();
  });

  it('shows the email address from formData.email', () => {
    render(<StepOTPVerify {...buildProps()} />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders exactly 6 digit input boxes', () => {
    render(<StepOTPVerify {...buildProps()} />);
    // Each box has aria-label "Digit N of 6"
    for (let i = 1; i <= 6; i++) {
      expect(
        screen.getByRole('textbox', { name: `Digit ${i} of 6` }),
      ).toBeInTheDocument();
    }
  });

  // ─── Continue button state ───────────────────────────────────────────────

  it('disables the Continue button when the OTP has empty strings', () => {
    render(<StepOTPVerify {...buildProps({ formData: mockFormData })} />);
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
  });

  it('enables the Continue button when all 6 digits are filled', () => {
    render(<StepOTPVerify {...buildProps({ formData: completedOtp })} />);
    expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled();
  });

  it('disables Continue when loading=true even if OTP is complete', () => {
    render(
      <StepOTPVerify
        {...buildProps({ formData: completedOtp, loading: true })}
      />,
    );
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
  });

  // ─── Button callbacks ────────────────────────────────────────────────────

  it('calls onBack when the Back button is clicked', async () => {
    const onBack = vi.fn();
    render(<StepOTPVerify {...buildProps({ onBack })} />);
    await userEvent.click(screen.getByRole('button', { name: /^back$/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('calls onResend when the "Resend code" button is clicked', async () => {
    const onResend = vi.fn();
    render(<StepOTPVerify {...buildProps({ onResend })} />);
    await userEvent.click(screen.getByRole('button', { name: /resend code/i }));
    expect(onResend).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when "Use a different email" is clicked', async () => {
    const onBack = vi.fn();
    render(<StepOTPVerify {...buildProps({ onBack })} />);
    await userEvent.click(
      screen.getByRole('button', { name: /use a different email/i }),
    );
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  // ─── Typing behaviour ────────────────────────────────────────────────────

  it('calls updateData with updated otp array when a digit is typed', () => {
    const updateData = vi.fn();
    render(<StepOTPVerify {...buildProps({ updateData })} />);
    const firstInput = screen.getByRole('textbox', { name: 'Digit 1 of 6' });
    fireEvent.change(firstInput, { target: { value: '7' } });
    expect(updateData).toHaveBeenCalledTimes(1);
    expect(updateData).toHaveBeenCalledWith({
      otp: ['7', '', '', '', '', ''],
    });
  });

  it('does not call updateData when a non-digit character is typed', () => {
    const updateData = vi.fn();
    render(<StepOTPVerify {...buildProps({ updateData })} />);
    const firstInput = screen.getByRole('textbox', { name: 'Digit 1 of 6' });
    fireEvent.change(firstInput, { target: { value: 'a' } });
    expect(updateData).not.toHaveBeenCalled();
  });

  // ─── Loading state ───────────────────────────────────────────────────────

  it('disables all OTP inputs when loading=true', () => {
    render(<StepOTPVerify {...buildProps({ loading: true })} />);
    for (let i = 1; i <= 6; i++) {
      expect(
        screen.getByRole('textbox', { name: `Digit ${i} of 6` }),
      ).toBeDisabled();
    }
  });

  it('inputs are enabled when loading=false', () => {
    render(<StepOTPVerify {...buildProps({ loading: false })} />);
    for (let i = 1; i <= 6; i++) {
      expect(
        screen.getByRole('textbox', { name: `Digit ${i} of 6` }),
      ).not.toBeDisabled();
    }
  });

  // ─── Keyboard / backspace ─────────────────────────────────────────────────

  it('moves focus to previous input on Backspace when current box is empty', () => {
    render(
      <StepOTPVerify
        {...buildProps({
          formData: { ...mockFormData, otp: ['1', '', '', '', '', ''] },
        })}
      />,
    );
    const secondInput = screen.getByRole('textbox', { name: 'Digit 2 of 6' });
    const firstInput = screen.getByRole('textbox', { name: 'Digit 1 of 6' });
    secondInput.focus();
    fireEvent.keyDown(secondInput, { key: 'Backspace' });
    expect(firstInput).toHaveFocus();
  });

  // ─── Paste ────────────────────────────────────────────────────────────────

  it('calls updateData with all pasted digits when a full code is pasted', () => {
    const updateData = vi.fn();
    render(<StepOTPVerify {...buildProps({ updateData })} />);
    const firstInput = screen.getByRole('textbox', { name: 'Digit 1 of 6' });
    fireEvent.paste(firstInput, {
      clipboardData: { getData: () => '123456' },
    });
    expect(updateData).toHaveBeenCalledWith({
      otp: ['1', '2', '3', '4', '5', '6'],
    });
  });

  it('ignores non-digit characters in pasted text', () => {
    const updateData = vi.fn();
    render(<StepOTPVerify {...buildProps({ updateData })} />);
    const firstInput = screen.getByRole('textbox', { name: 'Digit 1 of 6' });
    fireEvent.paste(firstInput, {
      clipboardData: { getData: () => 'abc' },
    });
    // "abc" produces no digits so updateData should not be called
    expect(updateData).not.toHaveBeenCalled();
  });
});
