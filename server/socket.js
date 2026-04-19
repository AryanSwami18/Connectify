import { Server as SocketIoServer } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "./models/MessageModel.js";
import User from "./models/UserModel.js";

const parseCookieHeader = (cookieHeader = "") =>
  cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((cookies, entry) => {
      const [name, ...valueParts] = entry.split("=");
      cookies[name] = decodeURIComponent(valueParts.join("="));
      return cookies;
    }, {});

const getSocketToken = (socket) => {
  const cookies = parseCookieHeader(socket.handshake.headers.cookie);
  const authToken = socket.handshake.auth?.token;

  if (cookies.jwt) {
    return cookies.jwt;
  }

  if (typeof authToken === "string" && authToken.trim()) {
    return authToken.replace(/^Bearer\s+/i, "");
  }

  return null;
};

const setupSocket = (server, allowedOrigins) => {
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

  const sentGroupMessage = async (message, currentUser) => {
    const { groupId, content, messageType, fileUrl } = message;
    console.log(message);
    try {
      // Create the new message for the group
      const createdMessage = await Message.create({
        sender: currentUser._id,
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


  const sentMessage = async (message, currentUser)=>{
        const senderId = currentUser._id.toString();
        const senderSocketId = userSocketMap.get(senderId);
        const recipientSocketId = userSocketMap.get(message.recipient)

        const createdMessage = await Message.create({
          ...message,
          sender: currentUser._id,
        })

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

  const handleCallUser = ({ to, offer }, currentUser) => {
    emitToUser(to, 'incoming-call', {
      from: currentUser._id,
      fromUser: {
        _id: currentUser._id,
        displayName: currentUser.displayName,
        email: currentUser.email,
        image: currentUser.image,
        color: currentUser.color,
      },
      offer,
    });
  };

  const handleAnswerCall = ({ to, answer }, currentUser) => {
    emitToUser(to, 'call-answered', {
      from: currentUser._id,
      answer,
    });
  };

  const handleIceCandidate = ({ to, candidate }, currentUser) => {
    emitToUser(to, 'ice-candidate', {
      from: currentUser._id,
      candidate,
    });
  };

  const handleDeclineCall = ({ to }, currentUser) => {
    emitToUser(to, 'call-declined', { from: currentUser._id });
  };

  const handleEndCall = ({ to }, currentUser) => {
    emitToUser(to, 'call-ended', { from: currentUser._id });
  };

  io.use(async (socket, next) => {
    try {
      const token = getSocketToken(socket);
      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const decodedTokenInformation = jwt.verify(token, process.env.JWT_KEY);
      const user = await User.findById(decodedTokenInformation?._id).select("-password");

      if (!user) {
        return next(new Error("Unauthorized"));
      }

      socket.data.user = user;
      socket.data.userId = user._id.toString();
      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });

  // Handling new connections
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const currentUser = socket.data.user;

    if (userId) {
      userSocketMap.set(userId, socket.id);
    } else {
      console.log('No user ID provided');
    }

    socket.on('sendMessage', (message) => sentMessage(message, currentUser))
    socket.on('sendGroupMessage', (message) => sentGroupMessage(message, currentUser))
    socket.on('call-user', (payload) => handleCallUser(payload, currentUser))
    socket.on('answer-call', (payload) => handleAnswerCall(payload, currentUser))
    socket.on('ice-candidate', (payload) => handleIceCandidate(payload, currentUser))
    socket.on('decline-call', (payload) => handleDeclineCall(payload, currentUser))
    socket.on('end-call', (payload) => handleEndCall(payload, currentUser))

    // Listen for disconnect events and handle accordingly
    socket.on('disconnect', () => {
      handleDisconnect(socket);
    });
  });
};

export default setupSocket;
