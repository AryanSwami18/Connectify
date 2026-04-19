import { useAppStore } from '@/store'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useSocket } from '@/context/socketContext'
import ContactContainer from './components/contactContainer'
import ChatContainer from './components/chatContainer'
import EmptyChatContainer from './components/emptyChatContainer'
import VideoCall from './components/videocallContainer'

function Chat() {
  const socket = useSocket()

  const {
    userInfo,
    selectedChatType,
    isInVideoCall,
    incomingVideoCall,
    acceptIncomingVideoCall,
    declineIncomingVideoCall,
    setSelectedChatData,
    setSelectedChatType,
  } = useAppStore()
  const navigate = useNavigate()
  useEffect(() => {
    if (!userInfo.profileSetup) {
      toast('Please Setup the profile before you access the chat')
      navigate('/profile')
    }
  },[userInfo,navigate])

  const handleAcceptCall = () => {
    if (incomingVideoCall) {
      setSelectedChatType('contact')
      setSelectedChatData(incomingVideoCall)
      acceptIncomingVideoCall()
    }
  }

  const handleDeclineCall = () => {
    if (socket && incomingVideoCall?._id) {
      socket.emit('decline-call', {
        to: incomingVideoCall._id,
        from: userInfo._id,
      })
    }

    declineIncomingVideoCall()
  }

  return (
    <div className='relative flex h-screen overflow-hidden bg-[#11131a] text-white'>
      {!isInVideoCall && <ContactContainer/>}    
      {isInVideoCall ? (
        <VideoCall className='w-full'/> 
      ) : selectedChatType === undefined ? (
        <EmptyChatContainer />
      ) : (
        <ChatContainer />
      )}

      {incomingVideoCall && !isInVideoCall && (
        <div className='absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4'>
          <div className='w-full max-w-md rounded-2xl border border-white/10 bg-[#1f1d2b] p-6 shadow-2xl'>
            <p className='text-sm uppercase tracking-[0.2em] text-emerald-400'>Incoming video call</p>
            <h2 className='mt-3 text-2xl font-semibold'>
              {incomingVideoCall.displayName || incomingVideoCall.email}
            </h2>
            <p className='mt-2 text-sm text-neutral-300'>
              Accept to join the call or decline to stay in chat.
            </p>
            <div className='mt-6 flex gap-3'>
              <button
                className='flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-medium text-black transition hover:bg-emerald-400'
                onClick={handleAcceptCall}
              >
                Accept
              </button>
              <button
                className='flex-1 rounded-xl bg-rose-500 px-4 py-3 font-medium text-white transition hover:bg-rose-400'
                onClick={handleDeclineCall}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat
