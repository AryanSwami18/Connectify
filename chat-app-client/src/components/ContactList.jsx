import { useAppStore } from '@/store';
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { AvatarImage } from '@/components/ui/avatar';
import {getColor} from '@/utils/utils'; // Ensure to import your color function
import moment from 'moment';

function ContactList({ contacts, isChannel = false }) {
  const { setSelectedChatType, setSelectedChatData, selectedChatData, setSelectedChatMessages } = useAppStore();
  console.log(contacts);
  
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
  };

  return (
    <div className='mt-5'>
      {contacts.map((contact) => (
        <div
          key={contact._id}
          className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${selectedChatData && selectedChatData._id === contact._id ? 'bg-[#8417ff] text-white' : 'bg-slate-800'}`}
          onClick={() => handleClick(contact)} // Pass function correctly
        >
          <div className='flex gap-5 items-center justify-start text-neutral-400'>
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
            <div className='flex flex-col'>
              <span className='font-bold'>
                {isChannel ? `# ${contact.name}` : (contact.displayName ? contact.displayName : ' ')}
              </span>
              {/* <span className='text-sm font-medium'>
                {moment(contact.latestMessageTime).format("LT")}
              </span> */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ContactList;
