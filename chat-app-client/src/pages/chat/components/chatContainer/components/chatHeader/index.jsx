import React from 'react';
import { RiCloseFill } from 'react-icons/ri';
import { useAppStore } from '@/store';
import { Avatar } from '@/components/ui/avatar';
import { AvatarImage } from '@/components/ui/avatar';
import { getColor } from '@/utils/utils';

function ChatHeader() {
  const { closeChat, selectedChatData } = useAppStore();

  return (
    <div className='h-[10vh] border-b-2 border-[#373747] flex items-center justify-between px-6'>
      <div className='flex gap-4 items-center'>
        <div className='w-12 h-12 relative'>
          <Avatar className='h-12 w-12 rounded-full overflow-hidden'>
            {selectedChatData.image ? (
              <AvatarImage
                src={selectedChatData.image}
                alt='Profile Image'
                className='object-cover w-full h-full bg-black'
              />
            ) : (
              <div
                className={`uppercase h-full w-full text-lg flex items-center justify-center rounded-full ${getColor(
                  selectedChatData.color
                )}`}
              >
                {selectedChatData.displayName
                  ? selectedChatData.displayName.charAt(0)
                  : selectedChatData.email.charAt(0)}
              </div>
            )}
          </Avatar>
        </div>

        <div className='flex flex-col'>
          <span className='font-bold'>
            {selectedChatData.displayName ? selectedChatData.displayName : ' '}
          </span>
        </div>
      </div>

      <button
        className='text-neutral-500 focus:outline-none focus:text-white transition-all duration-300'
        onClick={closeChat}
      >
        <RiCloseFill className='text-3xl' />
      </button>
    </div>
  );
}

export default ChatHeader;
