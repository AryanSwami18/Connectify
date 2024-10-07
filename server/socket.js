import { Server as SocketIoServer } from "socket.io";

const setupSocket = (server) => {
  const io = new SocketIoServer(server, {
    cors: {
      origin: process.env.ORIGIN, // Make sure this is well-defined
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  // Helper function to handle disconnection
  const handleDisconnect = (socket) => {
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socket.id === socketId) {
        userSocketMap.delete(userId);
        console.log(`User disconnected: ${userId} ::: socketId: ${socket.id}`);
        break;
      }
    }
  };

  // Handling new connections
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} ::: socketId: ${socket.id}`);
    } else {
      console.log('No user ID provided');
    }

    // Listen for disconnect events and handle accordingly
    socket.on('disconnect', () => {
      handleDisconnect(socket);
    });
  });
};

export default setupSocket;
