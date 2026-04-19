import React from 'react'
import ChatHeader from './components/chatHeader'
import MessageContainer from './components/messageContainer'
import MessageBar from './components/messageBar'

function ChatContainer() {
  return (
    <div className='flex h-full min-w-0 flex-1 flex-col bg-[#1c1d25]'>
      <ChatHeader/>
      <MessageContainer className='flex-1'/>
      <MessageBar/>
    </div>
  )
}

export default ChatContainer
