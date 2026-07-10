import mongoose from 'mongoose';
import { config } from './index.js';
import pc from 'picocolors';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(config.dbUri); // Connect to MongoDB
    console.log(pc.green('Connected to MongoDB database'));
  } catch (error) {
    console.error(pc.red('Failed to connect to database:'), error.message);
    process.exit(1); // Exit with an error code
  }
};

export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log(pc.yellow('Disconnected from MongoDB database'));
  } catch (error) {
    console.error(pc.red('Error disconnecting from database:'), error.message);
  }
};

export default { connectDatabase, disconnectDatabase };
