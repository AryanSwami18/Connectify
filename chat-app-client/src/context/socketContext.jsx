import { useAppStore } from "@/store";
import { HOST } from "@/utils/constant";
import { io } from "socket.io-client";
import { createContext, useContext, useEffect, useRef } from "react";

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const socket = useRef();
    const { userInfo } = useAppStore();

    useEffect(() => {
        if (userInfo) {
            // Initialize the socket connection
            socket.current = io(HOST, { withCredentials: true, query: { userId: userInfo._id } });

            socket.current.on("connect", () => {
                console.log('connected');
                
            });


            const handleRecieveMessage = (message) => {
                const { selectedChatData, selectedChatType ,addMessage} = useAppStore.getState()
                console.log(message);
                if (selectedChatType !== undefined && (selectedChatData._id === message.sender._id || selectedChatData._id === message.recipient._id)) {                    
                    addMessage(message)
                }
            }

            const handleReceiveGroupMessage = (message) => {
                const { selectedChatData, selectedChatType, addMessage,selectedChatMessages } = useAppStore.getState();
                console.log('the message has been recienved and kjbduiad');
                console.log(message.group._id);
                console.log(selectedChatData._id);
                
                if (selectedChatType === 'channel' && selectedChatData._id === message.group._id) {
                  addMessage(message);                  
                }
              };
            socket.current.on('newMessage', handleRecieveMessage)
            socket.current.on('newGroupMessage',handleReceiveGroupMessage)
            return () => {
                if (socket.current) {
                    socket.current.disconnect();
                }
            };
        }
    }, [userInfo]);

    // Provide the socket to the context
    return <SocketContext.Provider value={socket.current}>{children}</SocketContext.Provider>;
};
