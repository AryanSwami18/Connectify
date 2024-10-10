import { Server as SocketIoServer } from "socket.io";
import Message from "./models/MessageModel.js";
import User from "./models/UserModel.js";

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

  const sentGroupMessage = async (message) => {
    const { groupId, sender, content, messageType, fileUrl } = message;
    console.log(message);
    try {
      // Create the new message for the group
      const createdMessage = await Message.create({
        sender,
        group: groupId,
        messageType,
        content: messageType === 'text' ? content : null,
        fileUrl: messageType === 'file' ? fileUrl : null,
      });
  
      // Find the message with populated fields
      const messageData = await Message.findById(createdMessage._id)
        .populate('sender', 'id displayName email image color')
        .populate('group', 'name members admin'); // Assume admin is included in your group schema
      console.log(messageData);
  
      // Get all members of the group
      const groupMembers = messageData.group.members;
      const adminId = messageData.group.admin; // Fetch admin IDs
  
      // Combine members and admin IDs
      const allRecipients = new Set([...groupMembers,adminId]);
  
      // Emit the message to each group member and admin
      allRecipients.forEach((memberId) => {
        const recipientSocketId = userSocketMap.get(memberId.toString());
        console.log(`Emitting to ${memberId}: ${recipientSocketId ? 'Connected' : 'Not Connected'}`);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('newGroupMessage', messageData);
        }
      });
    } catch (error) {
      console.error('Error sending group message:', error);
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
    socket.on('sendGroupMessage',sentGroupMessage)

    // Listen for disconnect events and handle accordingly
    socket.on('disconnect', () => {
      handleDisconnect(socket);
    });
  });
};

export default setupSocket;
