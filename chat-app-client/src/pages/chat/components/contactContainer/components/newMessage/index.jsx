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
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { animationDefaultOption } from "@/utils/utils";
import Lottie from "react-lottie";
import { FaPlus } from 'react-icons/fa'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { SEARCH_CONTACTS_ROUTE } from '@/utils/constant';


function NewMessage() {
    const [openNewContactModal, setOpenNewContactModal] = useState(false)
    const [searchedContacts , setSearchedContact] = useState([])
    const searchContact = async (search) => {
        try {
            if (search.length > 0) {
                const response = await apiClient.post(SEARCH_CONTACTS_ROUTE,{search},{withCredentials:true})
                console.log(response);
                if(response.status === 200){
                    if(response.data.contacts &&  response.data.contacts.length > 0){
                        setSearchedContact(response.data.contacts)
                    }
                }
            }else{
                setSearchedContact([])
            }
        } catch (error) {
            toast.error(error.response.data.message)
        }
    }


    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger><FaPlus className='text-neutral-400 text-sm font-light text-opacity-90  text-start hover:text-neutral-200  cursor-pointer transition-all duration-300' onClick={() => { setOpenNewContactModal(true) }} /></TooltipTrigger>
                    <TooltipContent className='bg-[#1c1b1e] border-none text-white rounded-sm' >
                        New Message
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>


            <Dialog open={openNewContactModal} onOpenChange={setOpenNewContactModal} >
                <DialogContent className='bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col'>
                    <DialogHeader>
                        <DialogTitle>Select a contact</DialogTitle>
                        <DialogDescription>
                        </DialogDescription>
                    </DialogHeader>

                    <div>
                        <Input
                            placeholder='Search Contact'
                            className='rounded-lg border-none bg-[#2c2e3b] !important'
                            onChange={(e) => searchContact(e.target.value)}
                        />
                    </div>
                    {
                        searchedContacts.length === 0 && (
                            <div className='flex-1 md: md:flex flex-col justify-center items-center hidden duration-1000 transition-all'>

                                <Lottie options={animationDefaultOption} height={70} width={70} />
                                <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-10 lg:text-4xl text-3xl transition-all duration-300 text-center">
                                    <h1 className="text-xl font-bold poppins-medium">
                                        Search New <span className="text-purple-500">Contacts</span>
                                    </h1>
                                </div>
                            </div>
                        )
                    }
                </DialogContent>
            </Dialog>
        </>
    )
}
export default NewMessage





