import { useAppStore } from "@/store";
import { HOST } from "@/utils/constant";
import { io } from "socket.io-client";
import { createContext, useContext, useEffect, useRef } from "react";

const SocketContext = createContext(null);

export const useSocket = () => {
  // Return the context value directly (fixed context usage)
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef(null);
  const { userInfo } = useAppStore();

  useEffect(() => {
    if (userInfo) {
      // Initialize the socket connection
      socket.current = io(HOST, { withCredentials: true, query: { userId: userInfo._id } });

      socket.current.on("connect", () => {
        console.log("connected");
      });
    }

    return () => {
      // Cleanup and disconnect the socket when the component unmounts
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [userInfo]);

  // Provide the socket to the context
  return <SocketContext.Provider value={socket.current}>{children}</SocketContext.Provider>;
};
