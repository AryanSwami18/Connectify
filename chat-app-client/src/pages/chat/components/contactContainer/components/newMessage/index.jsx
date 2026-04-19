import React, { useState } from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FaPlus } from 'react-icons/fa'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { SEARCH_CONTACTS_ROUTE } from '@/utils/constant';
import { useAppStore } from '@/store';
import { Avatar } from '@/components/ui/avatar';
import { getColor } from '@/utils/utils';
import { AvatarImage } from '@/components/ui/avatar';

function NewMessage() {
    const {setSelectedChatType,setSelectedChatData} = useAppStore()
    const [openNewContactModal, setOpenNewContactModal] = useState(false)
    const [searchedContacts, setSearchedContact] = useState([])

    const searchContact = async (search) => {
        try {
            if (search.length > 0) {
                const response = await apiClient.post(SEARCH_CONTACTS_ROUTE, { search }, { withCredentials: true })
                if (response.status === 200) {
                    if (response.data.contacts && response.data.contacts.length > 0) {
                        setSearchedContact(response.data.contacts)
                    }
                }
            } else {
                setSearchedContact([])
            }
        } catch (error) {
            toast.error(error.response.data.message)
        }
    }


    const selectNewContact = (contact) => {
        setOpenNewContactModal(false)
        setSelectedChatType('contact')
        setSelectedChatData(contact)
        setSearchedContact([])
        
    }


    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type='button'
                            className='text-neutral-400 text-sm font-light text-opacity-90 text-start hover:text-neutral-200 cursor-pointer transition-all duration-300'
                            onClick={() => { setOpenNewContactModal(true) }}
                        >
                            <FaPlus />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent className='bg-[#1c1b1e] border-none text-white rounded-sm' >
                        New Message
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>


            <Dialog open={openNewContactModal} onOpenChange={setOpenNewContactModal} >
                <DialogContent className='bg-[#181920] border-none text-white w-[calc(100vw-2rem)] max-w-md h-[min(32rem,85vh)] flex flex-col gap-4 rounded-2xl p-5 sm:p-6'>
                    <DialogHeader>
                        <DialogTitle>Select a contact</DialogTitle>
                    </DialogHeader>
                    <div>
                        <Input
                            placeholder='Search Contact'
                            className='rounded-lg border-none bg-[#2c2e3b]'
                            onChange={(e) => searchContact(e.target.value)}
                        />
                    </div>
                    <ScrollArea className='h-[250px] pr-3 sm:h-[300px]'>
                        <div className="flex flex-col gap-5">
                            {searchedContacts.map((contact) => (
                                <div key={contact._id} className='flex gap-3 items-center cursor-pointer '
                                    onClick={() => selectNewContact(contact)}>
                                    <div className='w-12 h-12 relative'>
                                        <Avatar className='h-12 w-12  rounded-full overflow-hidden'>
                                            {contact.image ? (
                                                <AvatarImage src={contact.image} alt='Profile Image' className='object-cover w-full h-full bg-black' />
                                            ) : (
                                                <div className={`uppercase h-full w-full text-lg flex items-center justify-center rounded-full ${getColor(contact.color)}`}>
                                                    {contact.displayName ? contact.displayName.split('').shift() : contact.email.split('').shift()}
                                                </div>
                                            )}
                                        </Avatar>
                                    </div>
                                    <div className='flex  flex-col'>
                                        <span className='font-bold'>{contact.displayName ? `${contact.displayName}` : " "}</span>
                                        <span className='text-sm'>
                                            {contact.email ? `${contact.email}` : " "}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                          
                    </ScrollArea>
                    {
                        searchedContacts.length === 0 && (
                            <div className='flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-6 text-center'>
                                <div className='mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#2c2e3b] text-2xl text-neutral-300'>
                                    <FaPlus />
                                </div>
                                <h1 className="text-xl font-bold poppins-medium">
                                    Search New <span className="text-purple-500">Contacts</span>
                                </h1>
                                <p className='mt-2 text-sm text-neutral-400'>
                                    Type a name or email to start a direct conversation.
                                </p>
                            </div>
                        )
                    }
                </DialogContent>
            </Dialog>
        </>
    )
}
export default NewMessage





