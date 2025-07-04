export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;

export const API_ENDPOINTS = {
  CLIENTS: `${ENV.API_URL}/clients`,
  CLIENT_INCOME: `${ENV.API_URL}/client-income`,
  CLIENT_BUSINESSES: `${ENV.API_URL}/client-businesses`,
} as const; 