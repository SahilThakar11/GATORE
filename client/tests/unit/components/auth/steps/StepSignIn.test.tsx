import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepSignIn } from '../../../../../src/components/auth/steps/StepSignIn';

vi.mock('../../../../../src/components/auth/GoogleAuthButton', () => ({
  GoogleAuthButton: ({ onSuccess, label }: any) => (
    <button onClick={() => onSuccess({ email: 'g@gmail.com', name: 'Google User', sub: '123' })}>
      {label}
    </button>
  ),
}));

const baseFormData = {
  email: '',
  password: '',
  name: '',
  phone: '',
  otp: ['', '', '', '', '', ''],
  confirmPassword: '',
  error: null,
};

const mockHandlers = {
  updateData: vi.fn(),
  onSubmit: vi.fn(),
  onClose: vi.fn(),
  onSwitchToSignup: vi.fn(),
  onGoogleSuccess: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

const renderComponent = (formData = baseFormData) =>
  render(
    <StepSignIn
      formData={formData}
      {...mockHandlers}
      loading={false}
    />,
  );

describe('StepSignIn', () => {
  it('renders heading "Welcome back"', () => {
    renderComponent();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });

  it('renders email and password inputs', () => {
    renderComponent();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument();
  });

  it('Sign in button is disabled when form is empty', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled();
  });

  it('Sign in button is disabled with invalid email', () => {
    renderComponent({ ...baseFormData, email: 'notanemail', password: 'pass123' });
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled();
  });

  it('Sign in button is enabled with valid email and non-empty password', () => {
    renderComponent({ ...baseFormData, email: 'user@example.com', password: 'mypassword' });
    expect(screen.getByRole('button', { name: 'Sign in' })).not.toBeDisabled();
  });

  it('calls onSubmit when Sign in button clicked', () => {
    renderComponent({ ...baseFormData, email: 'user@example.com', password: 'mypassword' });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(mockHandlers.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Cancel button clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockHandlers.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSwitchToSignup when Sign up link clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    expect(mockHandlers.onSwitchToSignup).toHaveBeenCalledTimes(1);
  });

  it('calls onGoogleSuccess when Google button clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
    expect(mockHandlers.onGoogleSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'g@gmail.com' }),
    );
  });

  it('calls updateData when typing email', () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'new@test.com' } });
    expect(mockHandlers.updateData).toHaveBeenCalledWith({ email: 'new@test.com' });
  });

  it('calls updateData when typing password', () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText('Your password'), { target: { value: 'secret123' } });
    expect(mockHandlers.updateData).toHaveBeenCalledWith({ password: 'secret123' });
  });

  it('Sign in button is disabled when loading=true', () => {
    render(
      <StepSignIn
        formData={{ ...baseFormData, email: 'user@example.com', password: 'mypassword' }}
        {...mockHandlers}
        loading={true}
      />,
    );
    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
  });

  it('submits on Enter key press in password field when valid', () => {
    renderComponent({ ...baseFormData, email: 'user@example.com', password: 'mypassword' });
    fireEvent.keyDown(screen.getByPlaceholderText('Your password'), { key: 'Enter' });
    expect(mockHandlers.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not submit on Enter key press when invalid', () => {
    renderComponent({ ...baseFormData, email: 'bad-email', password: 'pw' });
    fireEvent.keyDown(screen.getByPlaceholderText('Your password'), { key: 'Enter' });
    expect(mockHandlers.onSubmit).not.toHaveBeenCalled();
  });
});
