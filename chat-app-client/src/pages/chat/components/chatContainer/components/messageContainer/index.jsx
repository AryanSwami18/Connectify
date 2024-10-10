import React, { useEffect, useRef } from 'react';
import { useAppStore } from '@/store';
import moment from 'moment';
import { apiClient } from '@/lib/apiClient';
import { GET_MESSAGES, GET_GROUP_MESSAGES } from '@/utils/constant'; // Make sure to import the new constant

function MessageContainer() {
  const { selectedChatType, selectedChatData, userInfo, selectedChatMessages, setSelectedChatMessages } = useAppStore();
  const scrollRef = useRef();

  useEffect(() => {
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
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

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
    console.log('this is to check if the chat works')
    console.log(message);
    return (
      <div className={`flex items-start my-2 ${isSender ? "justify-start" : "justify-end"}`}>
        <div className={`max-w-[75%] p-3 rounded-3xl ${isSender ? "bg-[#8417ff]/80 text-white" : "bg-gray-200 text-black"}`}>
          <p className="text-sm">{message.content ? message.content : message.message.content}</p>
          <span className={`text-xs mt-1 block text-right ${isSender ? 'text-white' : 'text-gray-500'}`}>
            {moment(message.timestamp).format("LT")}
          </span>
        </div>
      </div>
    );
  };

  const renderGroupMessage = (message) => {
    const isSender = message.sender._id === userInfo._id; 
    console.log(message);
    return (
      <div className={`flex items-start my-2 ${isSender ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[75%] p-3 rounded-3xl ${isSender ? "bg-[#8417ff]/80 text-white" : "bg-gray-200 text-black"}`}>
          {!isSender && (
            <div className="text-xs text-gray-500 mb-1">
              {message.sender.displayName}
            </div>
          )}
          <p className="text-sm">{message.content || message.message.content}</p>
          <span className={`text-xs mt-1 block text-right ${isSender ? 'text-white' : 'text-gray-500'}`}>
            {moment(message.timestamp).format("LT")}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[64vw] lg:w-[74vw] xl:w-[80vw] sm:w-full">
      {renderMessages()}
      <div ref={scrollRef}></div>
    </div>
  );
}

export default MessageContainer;
