import { useAppStore } from '@/store'
import React from 'react'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { getColor } from '@/utils/utils'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {FaEdit} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { IoIosLogOut } from "react-icons/io";
import { apiClient } from '@/lib/apiClient'


import {LOGOUT_ROUTE} from '@/utils/constant'
import { toast } from 'sonner'



function ProfileInfoComponent() {
    const { userInfo,setUserInfo } = useAppStore()
    const navigate = useNavigate()


    const handleLogout = async () =>{
        try {
            const response = await apiClient.post(LOGOUT_ROUTE,{},{withCredentials:true})
            if(response.status === 200){
                navigate('/auth')
                setUserInfo(null)
            }
        } catch (error) {
            toast.error(error.response.data.message)
        }
    }
    return (
        <div className='absolute bottom-0 flex h-16 w-full items-center justify-between gap-3 border-t border-white/10 bg-slate-700 px-4 sm:px-6'>
            <div className='flex min-w-0 items-center gap-3'>
                <div className='w-12 h-12 relative'>
                    <Avatar className='h-12 w-12  rounded-full overflow-hidden'>
                        {userInfo.image ? (
                            <AvatarImage src={userInfo.image} alt='Profile Image' className='object-cover w-full h-full bg-black' />
                        ) : (
                            <div className={`uppercase h-full w-full text-lg flex items-center justify-center rounded-full ${getColor(userInfo.color)}`}>
                                {userInfo.displayName ? userInfo.displayName.split('').shift() : userInfo.email.split('').shift()}
                            </div>
                        )}
                    </Avatar>
                </div>
                <div className='min-w-0 truncate text-sm font-medium text-white sm:text-base'>
                    {userInfo.displayName ? `${userInfo.displayName}` : " "}
                </div>
            </div>

            <div className='flex shrink-0 gap-3'>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button type='button' className='text-neutral-400 text-lg font-medium transition-colors hover:text-white' onClick={()=>{navigate('/profile')}}>
                                <FaEdit />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent className='bg-[#1c1b1e] border-none text-white rounded-sm' >
                            Edit  Profile
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>


                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button type='button' className='text-neutral-400 text-xl font-medium transition-colors hover:text-white' onClick={handleLogout}>
                                <IoIosLogOut />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent className='bg-[#1c1b1e] border-none text-white rounded-sm' >
                            Logout
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    )
}

export default ProfileInfoComponent
