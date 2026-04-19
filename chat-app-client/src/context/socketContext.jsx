import { useAppStore } from "@/store";
import { HOST } from "@/utils/constant";
import { io } from "socket.io-client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const SocketContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
    return useContext(SocketContext);
};

// eslint-disable-next-line react/prop-types
export const SocketProvider = ({ children }) => {
    const socket = useRef();
    const [socketInstance, setSocketInstance] = useState(null);
    const { userInfo } = useAppStore();

    useEffect(() => {
        if (userInfo) {
            // Initialize the socket connection
            socket.current = io(HOST, { withCredentials: true, query: { userId: userInfo._id } });
            setSocketInstance(socket.current);

            socket.current.on("connect", () => {
                console.log('connected');
                
            });

            const updateDirectMessageContacts = (message) => {
                const {
                    upsertMessageContact,
                    incrementUnreadCount,
                    selectedChatData,
                    selectedChatType,
                } = useAppStore.getState();
                const contact =
                    message.sender?._id === userInfo._id ? message.recipient : message.sender;
                const isIncomingMessage = message.sender?._id !== userInfo._id;
                const isActiveChat =
                    selectedChatType === 'contact' && selectedChatData?._id === contact?._id;

                if (!contact?._id) {
                    return;
                }

                upsertMessageContact({
                    _id: contact._id,
                    email: contact.email,
                    displayName: contact.displayName,
                    image: contact.image,
                    color: contact.color,
                    latestMessage:
                        message.messageType === 'file'
                            ? 'Attachment'
                            : message.content || message.message?.content || '',
                    latestMessageType: message.messageType,
                    latestMessageTime: message.timestamp,
                    unreadCount: isActiveChat ? 0 : undefined,
                });

                if (isIncomingMessage && !isActiveChat) {
                    incrementUnreadCount(contact._id);
                }
            };

            const handleRecieveMessage = (message) => {
                const { selectedChatData, selectedChatType ,addMessage} = useAppStore.getState()
                console.log(message);
                updateDirectMessageContacts(message);
                if (
                    selectedChatType !== undefined &&
                    selectedChatData?._id &&
                    (selectedChatData._id === message.sender._id || selectedChatData._id === message.recipient._id)
                ) {                    
                    addMessage(message)
                }
            }

            const handleReceiveGroupMessage = (message) => {
                const { selectedChatData, selectedChatType, addMessage } = useAppStore.getState();
                console.log('the message has been recienved and kjbduiad');
                console.log(message.group._id);
                console.log(selectedChatData?._id);
                
                if (selectedChatType === 'channel' && selectedChatData?._id === message.group._id) {
                  addMessage(message);                  
                }
              };

            const handleIncomingCall = ({ fromUser, offer }) => {
                const { isInVideoCall, setIncomingVideoCall } = useAppStore.getState();

                if (isInVideoCall) {
                    socket.current.emit("decline-call", {
                        to: fromUser?._id,
                        from: userInfo._id,
                    });
                    return;
                }

                setIncomingVideoCall({ participant: fromUser, offer });
                toast.info(`${fromUser?.displayName || fromUser?.email || "Someone"} is calling you`);
            };

            const handleCallDeclined = () => {
                const { isInVideoCall, resetVideoCall } = useAppStore.getState();
                if (isInVideoCall) {
                    return;
                }
                resetVideoCall();
                toast.error("The call was declined");
            };

            const handleCallEnded = () => {
                const { isInVideoCall, resetVideoCall } = useAppStore.getState();
                if (isInVideoCall) {
                    return;
                }
                resetVideoCall();
                toast.info("The call has ended");
            };

            socket.current.on('newMessage', handleRecieveMessage)
            socket.current.on('newGroupMessage',handleReceiveGroupMessage)
            socket.current.on('incoming-call', handleIncomingCall)
            socket.current.on('call-declined', handleCallDeclined)
            socket.current.on('call-ended', handleCallEnded)
            return () => {
                const currentSocket = socket.current;
                if (currentSocket) {
                    currentSocket.off('newMessage', handleRecieveMessage);
                    currentSocket.off('newGroupMessage', handleReceiveGroupMessage);
                    currentSocket.off('incoming-call', handleIncomingCall);
                    currentSocket.off('call-declined', handleCallDeclined);
                    currentSocket.off('call-ended', handleCallEnded);
                    currentSocket.disconnect();
                }
                socket.current = null;
                setSocketInstance(null);
            };
        }
    }, [userInfo]);

    return <SocketContext.Provider value={socketInstance}>{children}</SocketContext.Provider>;
};
