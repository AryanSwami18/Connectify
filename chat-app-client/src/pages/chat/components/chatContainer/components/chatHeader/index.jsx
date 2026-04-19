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
    <div className='flex min-h-16 items-center justify-between gap-3 border-b border-[#373747] px-3 py-3 sm:px-5'>
      <div className='flex min-w-0 items-center gap-3 sm:gap-4'>
        {selectedChatType === 'contact' && (
          <>
            <div className='relative h-10 w-10 sm:h-12 sm:w-12'>
              <Avatar className='h-10 w-10 rounded-full overflow-hidden sm:h-12 sm:w-12'>
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

            <div className='min-w-0 flex flex-col'>
              <span className='truncate font-bold'>
                {selectedChatData.displayName ? selectedChatData.displayName : ' '}
              </span>
              <span className='truncate text-xs text-neutral-400'>
                {selectedChatData.email || 'Direct message'}
              </span>
            </div>
          </>
        )}

        {selectedChatType === 'channel' && (
          <div className='min-w-0 flex flex-col'>
            <span className='truncate font-bold'>
              #{selectedChatData.name ? selectedChatData.name : 'Unnamed Channel'}
            </span>
            <span className='text-xs text-neutral-400'>Group chat</span>
          </div>
        )}
      </div>

      <div className='flex flex-row gap-2 sm:gap-4'>
        {
          selectedChatType === 'contact' && (
            <button
              type='button'
              className='rounded-lg p-2 text-neutral-500 transition-all duration-300 hover:bg-white/5 focus:outline-none focus:text-white'
              onClick={startVideoCall}
            >
              <GoDeviceCameraVideo className='text-2xl sm:text-3xl' />
            </button>
          )
        }


        <button
          type='button'
          className='rounded-lg p-2 text-neutral-500 transition-all duration-300 hover:bg-white/5 focus:outline-none focus:text-white'
          onClick={closeChat}
        >
          <RiCloseFill className='text-2xl sm:text-3xl' />
        </button>
      </div>

    </div>
  );
}

export default ChatHeader;
