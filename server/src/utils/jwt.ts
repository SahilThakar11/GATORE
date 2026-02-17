import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt";

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

// This function generates an access token with the given payload and returns it as a string
export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

// This function generates a refresh token with the given payload and returns it as a string
export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });
};

// This function verifies the given access token and returns the decoded payload if the token is valid, otherwise it throws an error
export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, jwtConfig.secret) as JWTPayload;
};

// This function verifies the given refresh token and returns the decoded payload if the token is valid, otherwise it throws an error
export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, jwtConfig.refreshSecret) as JWTPayload;
};

// This function calculates the expiration date for a refresh token, which is typically set to 7 days from the current date
export const getRefreshTokenExpirationDate = (): Date => {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);
  return expirationDate;
};
