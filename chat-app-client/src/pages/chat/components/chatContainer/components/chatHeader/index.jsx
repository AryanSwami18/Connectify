import React from 'react'
import {RiCloseFill} from 'react-icons/ri'
function ChatHeader() {
  return (
    <div className='h-[10vh] border-b-2 border-[#373747] flex items-center justify-between ps-15'>
        <div className='flex gap-5 items-center'>
            <div className='flex gap-3 items-center justify-center'>

            </div>

            <div className='flex gap 5 items-center justify-center'>
                <button className='text-neutral-500  focus:border-none focus:outline-none focus:text-white duration-300 transition-all '>
                <RiCloseFill className='text-3xl'/>
                </button>
            </div>
        </div>
    </div>
  )
}

export default ChatHeader