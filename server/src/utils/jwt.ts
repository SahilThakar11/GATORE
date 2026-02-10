import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt";

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, jwtConfig.secret) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, jwtConfig.refreshSecret) as JWTPayload;
};

export const getRefreshTokenExpirationDate = (): Date => {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);
  return expirationDate;
};
