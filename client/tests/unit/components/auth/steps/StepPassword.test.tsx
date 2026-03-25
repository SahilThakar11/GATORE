import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepPassword } from '../../../../../src/components/auth/steps/StepPassword';

const baseFormData = {
  email: 'test@example.com',
  password: '',
  confirmPassword: '',
  name: '',
  phone: '',
  otp: ['', '', '', '', '', ''],
  error: null,
};

const mockUpdateData = vi.fn();
const mockOnContinue = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('StepPassword', () => {
  it('renders heading "Create a password"', () => {
    render(<StepPassword formData={baseFormData} updateData={mockUpdateData} onContinue={mockOnContinue} loading={false} />);
    expect(screen.getByText('Create a password')).toBeInTheDocument();
  });

  it('shows the verified email address', () => {
    render(<StepPassword formData={baseFormData} updateData={mockUpdateData} onContinue={mockOnContinue} loading={false} />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders password and confirm password inputs', () => {
    render(<StepPassword formData={baseFormData} updateData={mockUpdateData} onContinue={mockOnContinue} loading={false} />);
    expect(screen.getByPlaceholderText('At least 8 characters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Re-enter your password')).toBeInTheDocument();
  });

  it('Continue button is disabled when password is empty', () => {
    render(<StepPassword formData={baseFormData} updateData={mockUpdateData} onContinue={mockOnContinue} loading={false} />);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('Continue button is disabled when passwords do not match', () => {
    const formData = { ...baseFormData, password: 'ValidPass1!', confirmPassword: 'DifferentPass1!' };
    render(<StepPassword formData={formData} updateData={mockUpdateData} onContinue={mockOnContinue} loading={false} />);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('shows "Passwords don\'t match" error when confirm differs', () => {
    const formData = { ...baseFormData, password: 'ValidPass1!', confirmPassword: 'Other1!' };
    render(<StepPassword formData={formData} updateData={mockUpdateData} onContinue={mockOnContinue} loading={false} />);
    expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
  });

  it('Continue button is enabled when all rules pass and passwords match', () => {
    const formData = { ...baseFormData, password: 'ValidPass1!', confirmPassword: 'ValidPass1!' };
    render(<StepPassword formData={formData} updateData={mockUpdateData} onContinue={mockOnContinue} loading={false} />);
    expect(screen.getByRole('button', { name: 'Continue' })).not.toBeDisabled();
  });

  it('calls onContinue when Continue button is clicked with valid data', () => {
    const formData = { ...baseFormData, password: 'ValidPass1!', confirmPassword: 'ValidPass1!' };
    render(<StepPassword formData={formData} updateData={mockUpdateData} onContinue={mockOnContinue} loading={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(mockOnContinue).toHaveBeenCalledTimes(1);
  });

  it('Continue button is disabled when loading=true', () => {
    const formData = { ...baseFormData, password: 'ValidPass1!', confirmPassword: 'ValidPass1!' };
    render(<StepPassword formData={formData} updateData={mockUpdateData} onContinue={mockOnContinue} loading={true} />);
    expect(screen.getByRole('button', { name: 'Setting up...' })).toBeDisabled();
  });

  it('shows password strength indicator when password has content', () => {
    const formData = { ...baseFormData, password: 'abc' };
    render(<StepPassword formData={formData} updateData={mockUpdateData} onContinue={mockOnContinue} loading={false} />);
    // strength text should appear
    expect(screen.getByText('Weak')).toBeInTheDocument();
  });

  it('shows Strong when all password rules pass', () => {
    const formData = { ...baseFormData, password: 'ValidPass1!' };
    render(<StepPassword formData={formData} updateData={mockUpdateData} onContinue={mockOnContinue} loading={false} />);
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  it('shows password rules checklist when password has content', () => {
    const formData = { ...baseFormData, password: 'a' };
    render(<StepPassword formData={formData} updateData={mockUpdateData} onContinue={mockOnContinue} loading={false} />);
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('One uppercase letter')).toBeInTheDocument();
  });

  it('toggle password visibility button is rendered', () => {
    render(<StepPassword formData={baseFormData} updateData={mockUpdateData} onContinue={mockOnContinue} loading={false} />);
    expect(screen.getAllByLabelText('Show password').length).toBeGreaterThan(0);
  });

  it('calls updateData when typing in password field', () => {
    render(<StepPassword formData={baseFormData} updateData={mockUpdateData} onContinue={mockOnContinue} loading={false} />);
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'NewPass1!' } });
    expect(mockUpdateData).toHaveBeenCalledWith({ password: 'NewPass1!' });
  });
});
