import { RiCloseFill } from 'react-icons/ri';
import { useAppStore } from '@/store';
import { Avatar } from '@/components/ui/avatar';
import { AvatarImage } from '@/components/ui/avatar';
import { GoDeviceCameraVideo } from "react-icons/go";
import { getColor } from '@/utils/utils';
import { useSocket } from '@/context/socketContext';
import { toast } from 'sonner';

function ChatHeader() {
  const socket = useSocket();
  const { closeChat, selectedChatData, selectedChatType, startOutgoingVideoCall } = useAppStore();
  const startVideoCall = async () => {
    if (!socket) {
      toast.error('Socket connection is not ready yet');
      return;
    }

    if (!selectedChatData?._id) {
      toast.error('Choose a contact before starting a call');
      return;
    }

    startOutgoingVideoCall(selectedChatData)
  }
  return (
    <div className='h-[10vh] border-b-2 border-[#373747] flex items-center justify-between px-3'>
      <div className='flex gap-4 items-center'>
        {/* Render Avatar and displayName if it's a contact */}
        {selectedChatType === 'contact' && (
          <>
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
          </>
        )}

        {/* If it's a channel, show the channel name */}
        {selectedChatType === 'channel' && (
          <div className='flex flex-col'>
            <span className='font-bold'>
              #{selectedChatData.name ? selectedChatData.name : 'Unnamed Channel'}
            </span>
          </div>
        )}
      </div>




      <div className='flex flex-row gap-5'>
        {
          selectedChatType == 'contact' && (
            <button
              className='text-neutral-500 focus:outline-none focus:text-white transition-all duration-300 '
              onClick={startVideoCall}
            >
              <GoDeviceCameraVideo className='text-3xl' />
            </button>
          )
        }


        <button
          className='text-neutral-500 focus:outline-none focus:text-white transition-all duration-300'
          onClick={closeChat}
        >
          <RiCloseFill className='text-3xl' />
        </button>
      </div>

    </div>
  );
}

export default ChatHeader;
