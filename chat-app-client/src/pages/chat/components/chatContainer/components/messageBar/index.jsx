import { useSocket } from '@/context/socketContext';
import { useAppStore } from '@/store';
import EmojiPicker from 'emoji-picker-react';
import React from 'react';
import { useState } from 'react';
import { GrAttachment } from 'react-icons/gr';
import { IoSend } from 'react-icons/io5';
import { RiEmojiStickerLine } from 'react-icons/ri';

function MessageBar() {
    const [message, setMessage] = useState("");
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const {selectedChatType,selectedChatData,userInfo}  =useAppStore()
    const socket = useSocket()

    const handleSubmitEmoji = (emoji) => {        
        setMessage((msg) => msg + emoji.emoji);
    };

    const handleSendMessage = async () => {
        if (!message.trim()) {
            return;
        }

        if(selectedChatType === 'contact'){
            socket.emit("sendMessage",{
                sender:userInfo._id,
                content:message.trim(),
                recipient:selectedChatData._id,
                messageType:'text',
                fileUrl:undefined
            })
            setMessage('')
        }else if(selectedChatType === 'channel'){
            socket.emit("sendGroupMessage",{
                sender:userInfo._id,
                content:message.trim(),
                messageType:'text',
                fileUrl:undefined,
                groupId:selectedChatData._id
            })
            setMessage('')
        }
    };

    return (
        <div className='relative flex items-center gap-3 border-t border-white/10 bg-[#1c1d25] px-3 py-3 sm:px-5 md:px-8'>
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-[#2a2b33] pr-3 sm:gap-5 sm:pr-5">
                <input
                    type='text'
                    className='h-12 flex-1 bg-transparent px-4 text-sm focus:border-none focus:outline-none sm:h-[60px] sm:text-base'
                    placeholder='Enter The Message'
                    onChange={(e) => { setMessage(e.target.value); }}
                    value={message}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSendMessage();
                        }
                    }}
                />
                <button type='button' className='hidden text-neutral-500 transition-all duration-300 focus:border-none focus:outline-none focus:text-white sm:block'>
                    <GrAttachment className='text-1xl' />
                </button>
                <div className="relative">
                    <button
                        type='button'
                        className='text-neutral-500 transition-all duration-300 focus:border-none focus:outline-none focus:text-white'
                        onClick={() => { setEmojiPickerOpen(prev => !prev); }} 
                    >
                        <RiEmojiStickerLine className='text-1xl' />
                    </button>
                    {emojiPickerOpen && ( 
                        <div className='absolute bottom-14 right-0 z-20 scale-[0.82] origin-bottom-right sm:bottom-16 sm:scale-100'>
                            <EmojiPicker
                                theme='dark'
                                onEmojiClick={handleSubmitEmoji}
                                autoFocusSearch={false}
                            />
                        </div>
                    )}
                </div>
            </div>
            <button
                type='button'
                className='flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 transition-all duration-300 hover:bg-purple-900 focus:border-none focus:outline-none focus:text-white sm:h-14 sm:w-14'
                onClick={handleSendMessage}
            >
                <IoSend className='text-1xl' />
            </button>
        </div>
    );
}

export default MessageBar;
