import { createServer } from 'http';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { initializeSocket } from './config/socket.js';
import { config } from './config/index.js';

// Connect to database
await connectDatabase();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Start server
server.listen(config.port, () => {
  console.log(`🚀 Server running at http://localhost:${config.port}/`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
