import React, { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { SEARCH_CONTACTS_ROUTE, CREATE_GROUP } from '@/utils/constant'; // Import the route for creating the group
import { Avatar } from '@/components/ui/avatar';
import { getColor } from '@/utils/utils';
import { AvatarImage } from '@/components/ui/avatar';
import { FaPlus } from 'react-icons/fa';
import { useAppStore } from '@/store';

function CreateGroup() {
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const [searchedContacts, setSearchedContact] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [groupName, setGroupName] = useState("");
  const { addGroups } = useAppStore(); // Add the addGroups function from store

  const searchContact = async (search) => {
    try {
      if (search.length > 0) {
        const response = await apiClient.post(SEARCH_CONTACTS_ROUTE, { search }, { withCredentials: true });
        if (response.status === 200) {
          if (response.data.contacts && response.data.contacts.length > 0) {
            setSearchedContact(response.data.contacts);
          }
        }
      } else {
        setSearchedContact([]);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const selectNewContact = (contact) => {
    setSelectedContacts([...selectedContacts, contact]); // Add selected contact to the list
    setSearchedContact([]); // Clear search results
  };

  const handleGroupNameChange = (e) => {
    setGroupName(e.target.value); // Update group name
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedContacts.length === 0) {
      return toast.error('Group name and contacts are required');
    }

    try {
      const members = selectedContacts.map(contact => contact._id);
      const response = await apiClient.post(CREATE_GROUP, {
        name: groupName,
        members,
      }, { withCredentials: true });

      if (response.status === 200) {
        toast.success('Group created successfully');
        addGroups(response.data.group); // Add the new group to the store
        setOpenNewContactModal(false); // Close the modal
        setSelectedContacts([]); // Clear the selected contacts
        setGroupName(''); // Clear the group name input
      }
    } catch (error) {
        console.log(error);
      toast.error(error.response?.data?.message || 'Failed to create group');
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className='text-neutral-400 text-sm font-light text-opacity-90 text-start hover:text-neutral-200 cursor-pointer transition-all duration-300'
              onClick={() => { setOpenNewContactModal(true); }}
            />
          </TooltipTrigger>
          <TooltipContent className='bg-[#1c1b1e] border-none text-white rounded-sm'>
            New Group
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={openNewContactModal} onOpenChange={setOpenNewContactModal}>
        <DialogContent className='bg-[#181920] border-none text-white w-[400px] h-[500px] flex flex-col'>
          <DialogHeader>
            <DialogTitle>Select Contacts for Group</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <div>
            <Input
              placeholder='Search Contact'
              className='rounded-lg border-none bg-[#2c2e3b] !important'
              onChange={(e) => searchContact(e.target.value)}
            />
          </div>

          <ScrollArea className='h-[250px]'>
            <div className="flex flex-col gap-5">
              {searchedContacts.map((contact) => (
                <div key={contact._id} className='flex gap-3 items-center cursor-pointer' onClick={() => selectNewContact(contact)}>
                  <Avatar className='h-12 w-12 rounded-full overflow-hidden'>
                    {contact.image ? (
                      <AvatarImage src={contact.image} alt='Profile Image' className='object-cover w-full h-full bg-black' />
                    ) : (
                      <div className={`uppercase h-32 w-32 md:w-48 md:h-48 text-lg flex items-center justify-center rounded-full ${getColor(contact.color)}`}>
                        {contact.displayName ? contact.displayName.charAt(0) : contact.email.charAt(0)}
                      </div>
                    )}
                  </Avatar>
                  <div className='flex flex-col'>
                    <span className='font-bold'>{contact.displayName || ' '}</span>
                    <span className='text-sm'>{contact.email || ' '}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {selectedContacts.length > 0 && (
            <div className="mt-3">
              <h3 className="text-white">Selected Contacts:</h3>
              <ul className="text-neutral-400">
                {selectedContacts.map((contact) => (
                  <li key={contact._id}>{contact.displayName || contact.email}</li>
                ))}
              </ul>
            </div>
          )}

          <div className='mt-5'>
            <Input
              placeholder='Enter Group Name'
              className='rounded-lg border-none bg-[#2c2e3b] !important'
              value={groupName}
              onChange={handleGroupNameChange}
            />
          </div>

          <button
            className="mt-5 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            onClick={handleCreateGroup}
          >
            Create Group
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CreateGroup;
