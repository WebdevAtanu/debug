import mongoose from 'mongoose';
import { config } from './index.js';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(config.dbUri);
    console.log('✅ Connected to MongoDB database');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB database');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error.message);
  }
};

export default { connectDatabase, disconnectDatabase };
