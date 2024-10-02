import EmojiPicker from 'emoji-picker-react';
import React, { useRef } from 'react';
import { useState } from 'react';
import { GrAttachment } from 'react-icons/gr';
import { IoSend } from 'react-icons/io5';
import { RiEmojiStickerLine } from 'react-icons/ri';

function MessageBar() {
    const emojiRef = useRef();
    const [message, setMessage] = useState("");
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

    const handleSubmitEmoji = (emoji) => {        
        setMessage((msg) => msg + emoji.emoji);
    };

    const handleSendMessage = async () => {
        // Logic for sending the message
    };

    return (
        <div className='h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-2 gap-6'>
            <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center pr-5 gap-5">
                <input
                    type='text'
                    className='flex-1 bg-transparent rounded-sm focus:border-none focus:outline-none h-[60px] px-4'
                    placeholder='Enter The Message'
                    onChange={(e) => { setMessage(e.target.value); }}
                    value={message}
                />
                <button className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all'>
                    <GrAttachment className='text-1xl' />
                </button>
                <div className="relative">
                    <button
                        className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all'
                        onClick={() => { setEmojiPickerOpen(prev => !prev); }} 
                    >
                        <RiEmojiStickerLine className='text-1xl' />
                    </button>
                    {emojiPickerOpen && ( 
                        <div className='absolute bottom-16 right-0'>
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
                className='bg-purple-600 flex items-center justify-center rounded-xl p-5 focus:border-none focus:outline-none focus:text-white duration-300 transition-all hover:bg-purple-900'
                onClick={handleSendMessage}
            >
                <IoSend className='text-1xl' />
            </button>
        </div>
    );
}

export default MessageBar;
