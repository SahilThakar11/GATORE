export const generateOTP = (): string => {
  // Generate 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getOTPExpirationTime = (): Date => {
  // OTP expires in 10 minutes
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 10);
  return expirationTime;
};

export const isOTPExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};
