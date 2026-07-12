import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Development configuration
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'bug_hunter',
    },
    migrations: {
      directory: './migrations', // Path to your migration files
    },
    seeds: {
      directory: './seeds', // Path to your seed files
    },
  },

  // Production configuration
  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false },
    },
    migrations: {
      directory: './migrations', 
    },
    seeds: {
      directory: './seeds',
    },
  },
};

export default config;
