import dotenv from "dotenv";

interface JWTConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: any;
  refreshExpiresIn: any;
}

dotenv.config();

const getEnvVariable = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
};

export const jwtConfig: JWTConfig = {
  secret: getEnvVariable("JWT_SECRET"),
  refreshSecret: getEnvVariable("JWT_REFRESH_SECRET"),
  expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
};

console.log("✅ JWT configuration loaded successfully");
