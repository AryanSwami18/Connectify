import { Server as SocketIoServer } from "socket.io";
import Message from "./models/MessageModel.js";

const allowedOrigins = (process.env.ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const setupSocket = (server) => {
  const io = new SocketIoServer(server, {
    cors: {
      origin: allowedOrigins, 
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

  const emitToUser = (userId, event, payload) => {
    const socketId = userSocketMap.get(userId?.toString());
    if (socketId) {
      io.to(socketId).emit(event, payload);
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

  const handleCallUser = ({ to, from, fromUser, offer }) => {
    emitToUser(to, 'incoming-call', {
      from,
      fromUser,
      offer,
    });
  };

  const handleAnswerCall = ({ to, from, answer }) => {
    emitToUser(to, 'call-answered', {
      from,
      answer,
    });
  };

  const handleIceCandidate = ({ to, from, candidate }) => {
    emitToUser(to, 'ice-candidate', {
      from,
      candidate,
    });
  };

  const handleDeclineCall = ({ to, from }) => {
    emitToUser(to, 'call-declined', { from });
  };

  const handleEndCall = ({ to, from }) => {
    emitToUser(to, 'call-ended', { from });
  };

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
    socket.on('call-user', handleCallUser)
    socket.on('answer-call', handleAnswerCall)
    socket.on('ice-candidate', handleIceCandidate)
    socket.on('decline-call', handleDeclineCall)
    socket.on('end-call', handleEndCall)

    // Listen for disconnect events and handle accordingly
    socket.on('disconnect', () => {
      handleDisconnect(socket);
    });
  });
};

export default setupSocket;
