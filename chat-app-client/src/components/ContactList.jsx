/* eslint-disable react/prop-types */
import { useAppStore } from '@/store';
import { Avatar } from '@/components/ui/avatar';
import { AvatarImage } from '@/components/ui/avatar';
import {getColor} from '@/utils/utils'; // Ensure to import your color function
import moment from 'moment';

function ContactList({ contacts, isChannel = false }) {
  const {
    setSelectedChatType,
    setSelectedChatData,
    selectedChatData,
    setSelectedChatMessages,
    clearUnreadCount,
  } = useAppStore();

  const getLastMessagePreview = (contact) => {
    if (contact.latestMessageType === 'file') {
      return 'Attachment';
    }

    return contact.latestMessage || 'Start a conversation';
  };
  
  const handleClick = (contact) => {
    if (isChannel) {
      setSelectedChatType('channel');
    } else {
      setSelectedChatType('contact');
    }

    setSelectedChatData(contact);

    // Clear messages if switching to a different contact
    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }

    if (!isChannel) {
      clearUnreadCount(contact._id);
    }
  };

  return (
    <div className='mt-5'>
      {contacts.map((contact) => (
        <div
          key={contact._id}
          className={`mx-2 mb-2 cursor-pointer rounded-2xl border px-4 py-3 transition-all duration-300 ${
            selectedChatData && selectedChatData._id === contact._id
              ? 'border-[#8417ff] bg-[#8417ff]/20 text-white'
              : contact.unreadCount
                ? 'border-emerald-500/60 bg-emerald-500/10 text-white shadow-[0_0_0_1px_rgba(16,185,129,0.15)]'
                : 'border-transparent bg-slate-800 text-neutral-300 hover:border-white/10 hover:bg-slate-700/70'
          }`}
          onClick={() => handleClick(contact)}
        >
          <div className='flex items-center gap-4'>
            {!isChannel && (
              <Avatar className='h-12 w-12 rounded-full overflow-hidden'>
                {contact.image ? (
                  <AvatarImage
                    src={contact.image}
                    alt='Profile Image'
                    className='object-cover w-full h-full bg-black'
                  />
                ) : (
                  <div
                    className={`uppercase h-full w-full text-lg flex items-center justify-center rounded-full ${getColor(contact.color)}`}
                  >
                    {contact.displayName ? contact.displayName.charAt(0) : contact.email.charAt(0)} 
                  </div>
                )}
              </Avatar>
            )}

            <div className='min-w-0 flex-1'>
              <div className='flex items-center justify-between gap-3'>
                <span className='truncate font-bold'>
                  {isChannel ? `# ${contact.name}` : (contact.displayName ? contact.displayName : contact.email)}
                </span>
                {contact.latestMessageTime && (
                  <span className={`shrink-0 text-xs ${contact.unreadCount ? 'text-emerald-300' : 'text-neutral-500'}`}>
                    {moment(contact.latestMessageTime).fromNow()}
                  </span>
                )}
              </div>

              {!isChannel && (
                <div className='mt-1 flex items-center justify-between gap-3'>
                  <span className={`truncate text-sm ${contact.unreadCount ? 'font-semibold text-white' : 'text-neutral-400'}`}>
                    {getLastMessagePreview(contact)}
                  </span>
                  {!!contact.unreadCount && (
                    <span className='flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-500 px-2 text-xs font-bold text-black'>
                      {contact.unreadCount}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ContactList;
