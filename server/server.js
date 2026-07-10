import { createServer } from 'http';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { initializeSocket } from './config/socket.js';
import { config } from './config/index.js';
import pc from 'picocolors';

await connectDatabase(); // Connect to database
const server = createServer(app); // Create HTTP server
initializeSocket(server); // Initialize Socket.io

// Start server
server.listen(config.port, () => {
  console.log(pc.green(`Server running at http://localhost:${config.port}/`));
  console.log(pc.cyan(`Environment: ${config.nodeEnv}`));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log(pc.yellow('HTTP server closed'));
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log(pc.yellow('HTTP server closed'));
    process.exit(0);
  });
});
