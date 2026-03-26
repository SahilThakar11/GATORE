import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepProfile } from '../../../../../src/components/auth/steps/StepProfile';

const baseFormData = {
  email: 'test@example.com',
  password: '',
  confirmPassword: '',
  name: '',
  phone: '',
  otp: ['', '', '', '', '', ''],
  error: null,
};

const mockHandlers = {
  updateData: vi.fn(),
  onContinue: vi.fn(),
  onBack: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('StepProfile', () => {
  it('renders heading "Tell us about yourself"', () => {
    render(<StepProfile formData={baseFormData} {...mockHandlers} loading={false} />);
    expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
  });

  it('renders name and phone inputs', () => {
    render(<StepProfile formData={baseFormData} {...mockHandlers} loading={false} />);
    expect(screen.getByPlaceholderText('What should we call you?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('(416) 555-0100')).toBeInTheDocument();
  });

  it('Continue is disabled when name is empty', () => {
    render(<StepProfile formData={baseFormData} {...mockHandlers} loading={false} />);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('Continue is enabled when name is non-empty', () => {
    render(<StepProfile formData={{ ...baseFormData, name: 'Alice' }} {...mockHandlers} loading={false} />);
    expect(screen.getByRole('button', { name: 'Continue' })).not.toBeDisabled();
  });

  it('Continue is disabled when phone has invalid length', () => {
    render(
      <StepProfile
        formData={{ ...baseFormData, name: 'Alice', phone: '416-555' }}
        {...mockHandlers}
        loading={false}
      />,
    );
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('shows phone error message for invalid phone', () => {
    render(
      <StepProfile
        formData={{ ...baseFormData, name: 'Alice', phone: '416-555' }}
        {...mockHandlers}
        loading={false}
      />,
    );
    expect(screen.getByText('Please enter a valid 10-digit phone number')).toBeInTheDocument();
  });

  it('Continue is enabled with valid name and empty phone', () => {
    render(
      <StepProfile formData={{ ...baseFormData, name: 'Alice', phone: '' }} {...mockHandlers} loading={false} />,
    );
    expect(screen.getByRole('button', { name: 'Continue' })).not.toBeDisabled();
  });

  it('calls onContinue when button clicked with valid input', () => {
    render(<StepProfile formData={{ ...baseFormData, name: 'Alice' }} {...mockHandlers} loading={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(mockHandlers.onContinue).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when Back button clicked', () => {
    render(<StepProfile formData={{ ...baseFormData, name: 'Alice' }} {...mockHandlers} loading={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(mockHandlers.onBack).toHaveBeenCalledTimes(1);
  });

  it('Continue is disabled when loading=true', () => {
    render(<StepProfile formData={{ ...baseFormData, name: 'Alice' }} {...mockHandlers} loading={true} />);
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  });

  it('calls updateData with name when typing', () => {
    render(<StepProfile formData={baseFormData} {...mockHandlers} loading={false} />);
    fireEvent.change(screen.getByPlaceholderText('What should we call you?'), { target: { value: 'Bob' } });
    expect(mockHandlers.updateData).toHaveBeenCalledWith({ name: 'Bob' });
  });

  it('formats phone number on input', () => {
    render(<StepProfile formData={baseFormData} {...mockHandlers} loading={false} />);
    fireEvent.change(screen.getByPlaceholderText('(416) 555-0100'), { target: { value: '4165551234' } });
    // formatPhone should have been called resulting in formatted value
    expect(mockHandlers.updateData).toHaveBeenCalledWith({ phone: '(416) 555-1234' });
  });
});
