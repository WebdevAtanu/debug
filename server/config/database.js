import knex from 'knex';
import { config } from './index.js';
import pc from 'picocolors';

const db = knex({
  client: 'mysql2',
  connection: {
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
  },
});

export const connectDatabase = async () => {
  try {
    await db.raw('SELECT 1'); // Test the connection by executing a simple query
    console.log(pc.green('Connected to MySQL database'));
  } catch (error) {
    console.error(pc.red('Failed to connect to database:'), error.message);
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  try {
    await db.destroy();
    console.log(pc.yellow('Disconnected from MySQL database'));
  } catch (error) {
    console.error(pc.red('Error disconnecting from database:'), error.message);
  }
};

export default db;
