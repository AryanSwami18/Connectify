import React, { useEffect, useRef } from 'react';
import { useAppStore } from '@/store';
import moment from 'moment';
import { apiClient } from '@/lib/apiClient';
import { GET_MESSAGES, GET_GROUP_MESSAGES } from '@/utils/constant'; // Make sure to import the new constant
import { toast } from 'sonner';

function MessageContainer() {
  const { selectedChatType, selectedChatData, userInfo, selectedChatMessages, setSelectedChatMessages } = useAppStore();
  const scrollRef = useRef();

  useEffect(() => {
    if (!selectedChatData?._id) {
      return undefined;
    }

    const getMessages = async () => {
      try {
        const response = await apiClient.post(GET_MESSAGES, { id: selectedChatData._id }, { withCredentials: true });
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        toast.error(error.response.data.message);
      }
    };

    const getGroupMessages = async () => {
      try {
        const response = await apiClient.get(`${GET_GROUP_MESSAGES}/${selectedChatData._id}`, { withCredentials: true });
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log(error);
        
      }
    };

    if (selectedChatData._id) {
      if (selectedChatType === 'contact') {
        getMessages();
      } else if (selectedChatType === 'channel') {
        getGroupMessages(); // Call the new function for group messages
      }
    }

    return undefined;
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChatMessages]);

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format('YYYY-MM-DD');
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      return (
        <div key={index} className="">
          {showDate && (
            <div className="text-center text-neutral-500 my-2">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {
            selectedChatType === 'contact' && renderDMMessages(message)
          }
          {
            selectedChatType === 'channel' && renderGroupMessage(message)
          }
        </div>
      );
    });
  };

  const renderDMMessages = (message) => {
    const isSender = message.sender === selectedChatData._id;
    return (
      <div className={`flex items-start my-2 ${isSender ? "justify-start" : "justify-end"}`}>
        <div className={`max-w-[85%] rounded-3xl p-3 sm:max-w-[75%] ${isSender ? "bg-[#8417ff]/80 text-white" : "bg-gray-200 text-black"}`}>
          <p className="break-words text-sm">{message.content ? message.content : message.message.content}</p>
          <span className={`text-xs mt-1 block text-right ${isSender ? 'text-white' : 'text-gray-500'}`}>
            {moment(message.timestamp).format("LT")}
          </span>
        </div>
      </div>
    );
  };

  const renderGroupMessage = (message) => {
    const isSender = message.sender._id === userInfo._id; 
    return (
      <div className={`flex items-start my-2 ${isSender ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[85%] rounded-3xl p-3 sm:max-w-[75%] ${isSender ? "bg-[#8417ff]/80 text-white" : "bg-gray-200 text-black"}`}>
          {!isSender && (
            <div className="text-xs text-gray-500 mb-1">
              {message.sender.displayName}
            </div>
          )}
          <p className="break-words text-sm">{message.content || message.message.content}</p>
          <span className={`text-xs mt-1 block text-right ${isSender ? 'text-white' : 'text-gray-500'}`}>
            {moment(message.timestamp).format("LT")}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden px-3 py-4 sm:px-5 md:px-8">
      {renderMessages()}
      <div ref={scrollRef}></div>
    </div>
  );
}

export default MessageContainer;
