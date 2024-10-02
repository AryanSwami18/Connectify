import React from 'react'
import ChatHeader from './components/chatHeader'
import MessageContainer from './components/messageContainer'
import MessageBar from './components/messageBar'

function ChatContainer() {
  return (
    <div className='flex flex-col top-0 h-[100vh] w-[100vw] bg-[#1c1d25]'>
      <ChatHeader/>
      <MessageContainer className='flex-1'/>
      <MessageBar/>
    </div>
  )
}

export default ChatContainer