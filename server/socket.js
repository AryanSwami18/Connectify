import { Server as SocketIoServer } from "socket.io";
import Message from "./models/MessageModel.js";

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
        break;
      }
    }
  };


  const sentMessage = async (message)=>{
        const senderSocketId = userSocketMap.get(message.sender);
        const recipientSocketId = userSocketMap.get(message.recipient)

        const createdMessage = await Message.create(message)

        const messageData  =await Message.findById(createdMessage._id)
            .populate('sender',"id displayName email image color")
            .populate('recipient',"id displayName email image color")
        
        if(recipientSocketId){
            io.to(recipientSocketId).emit('newMessage',messageData)
        }
        if(senderSocketId){
            io.to(senderSocketId).emit('newMessage',messageData)
        }
  }

  // Handling new connections
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
    } else {
      console.log('No user ID provided');
    }

    socket.on('sendMessage',sentMessage)

    // Listen for disconnect events and handle accordingly
    socket.on('disconnect', () => {
      handleDisconnect(socket);
    });
  });
};

export default setupSocket;
