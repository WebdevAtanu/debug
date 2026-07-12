import { Server } from 'socket.io'; // Import the Server class from the socket.io package

let io; // Socket.io instance

// Initialize Socket.io with the provided HTTP server
export const initializeSocket = (server) => {
  io = new Server(server); // Initialize Socket.io with the provided server

  io.on('connection', (socket) => {
    console.log('New client connected via Socket.io');

    socket.on('send-notification', () => {
      console.log('New notification triggered');
      socket.broadcast.emit('received-notification', {
        message: 'New notifications',
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected from Socket.io');
    });
  });

  return io;
};

// Get the Socket.io instance
export const getSocketInstance = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket first.');
  }
  return io;
};

export default { initializeSocket, getSocketInstance };
