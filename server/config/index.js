import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bug_hunter',
  },

  tokenSecret: process.env.TOKEN_SECRET,

  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    from: process.env.EMAIL_FROM || 'noreply@bughunter.com',
  },

  cors: {
    credentials: true,
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  },

  rateLimit: {
    windowMs: 25 * 60 * 1000,
    max: 500,
    message: { error: 'Too many requests. Please try again in 25 minutes.' },
  },

  bugRateLimit: {
    windowMs: 60 * 60 * 1000,
    max: 2,
    message: { error: "Easy there! You can submit up to 2 bug reports per hour. Please try again later." },
  },
};

export default config;
