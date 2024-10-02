import { useAppStore } from '@/store'
import React from 'react'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { getColor } from '@/utils/utils'
function ProfileInfoComponent() {
    const { userInfo } = useAppStore()
    return (
        <div className='absolute bottom-0 h-16 flex items-center justify-between px-10 w-full bg-slate-700'>
            <div className='flex items-center gap-3 justify-center '>
                <div className='w-12 h-12 relative'>
                    <Avatar className='h-12 w-12  rounded-full overflow-hidden'>
                        {userInfo.image ? (
                            <AvatarImage src={userInfo.image} alt='Profile Image' className='object-cover w-full h-full bg-black' />
                        ) : (
                            <div className={`uppercase h-32 w-32 md:w-48 md:h-48 text-lg flex items-center justify-center rounded-full ${getColor(userInfo.color)}`}>
                                {userInfo.displayName ? userInfo.displayName.split('').shift() : userInfo.email.split('').shift()}
                            </div>
                        )}
                    </Avatar>
                </div>
                <div>
                    {userInfo.displayName}
                </div>
            </div>
        </div>
    )
}

export default ProfileInfoComponent