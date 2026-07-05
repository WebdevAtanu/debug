import { Server } from 'socket.io';

let io;

export const initializeSocket = (server) => {
  io = new Server(server);

  io.on('connection', (socket) => {
    console.log('✅ New client connected via Socket.io');

    socket.on('send-notification', () => {
      console.log('📢 New notification triggered');
      socket.broadcast.emit('received-notification', {
        message: 'New notifications',
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected from Socket.io');
    });
  });

  return io;
};

export const getSocketInstance = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket first.');
  }
  return io;
};

export default { initializeSocket, getSocketInstance };
