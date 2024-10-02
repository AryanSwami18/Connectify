import { useAppStore } from '@/store'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import ContactContainer from './components/contactContainer'
import ChatContainer from './components/chatContainer'
import EmptyChatContainer from './components/emptyChatContainer'

function Chat() {

  const { userInfo } = useAppStore()
  const navigate = useNavigate()
  useEffect(() => {
    console.log(userInfo);
    if (!userInfo.profileSetup) {
      toast('Please Setup the profile before you access the chat')
      navigate('/profile')
    }
  },[userInfo,navigate])
  return (
    <div className='h-[100vh] text-white flex'>
    <ContactContainer/>
    <ChatContainer/>
    {/* <EmptyChatContainer/> */}
    </div>
  )
}

export default Chat