import { useAppStore } from '@/store'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { IoArrowBack } from 'react-icons/io5'
import { Avatar } from '@/components/ui/avatar'
import { AvatarImage } from '@radix-ui/react-avatar'
import { getColor, colorCombinations } from '@/utils/utils'
import { FaTrash, FaPlus } from 'react-icons/fa'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { apiClient } from '@/lib/apiClient'
import { UPDATE_PROFILE_ROUTE } from '@/utils/constant'

function Profile() {
  const navigate = useNavigate()
  const { userInfo, setUserInfo } = useAppStore()
  const [displayName, setDisplayName] = useState('')
  const [image, setImage] = useState('')
  const [hovered, setHovered] = useState(false)
  const [selectedColor, setSelectedColor] = useState(1)


  const validateProfile = ()=>{
    if(!displayName){
      toast.error('Please Enter  A Name')
      return false
    }

    if (!/^[A-Za-z ]+$/.test(displayName)) {
      toast.error('Name should not contain numbers or special characters');
      return false;
    }

    return true
  }


  const saveChanges = async () => { 
    if(validateProfile()){
      try {
        const response = await apiClient.post(UPDATE_PROFILE_ROUTE,{displayName,selectedColor},{withCredentials:true})
        console.log(response);
        
        if(response.status === 200 && response.data.user.profileSetup === true){
          setUserInfo({...response.data.user})
          toast.success("Profile Updated")
          navigate('/chat')
        }        
      } catch (error) {
        console.log(error);
      }
    }
  }
  return (
    <div className='bg-[#1b1c24] h-[100vh] flex items-center justify-center flex-col gap-20'>
      <div className='flex flex-col gap-10 w-[80vw] md:w-max'>
        <div className=''>
          <IoArrowBack className='text-4xl lg:text-6xl text-white  text-opacity-90 curser-pointer' />
        </div>

        <div className='grid grid-cols-2'>
          <div className='h-32 w-32 md:w-48 md:h-48 relative flex items-center justify-center'
            onMouseEnter={() => { setHovered(true) }}
            onMouseLeave={() => { setHovered(false) }}
          >
            <Avatar className='h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden'>
              {image ? (<AvatarImage src={image} alt='Profile Image' className='object-cover w-full h-full bg-black' />) : (<div className={`uppercase h-32 w-32 md:w-48 md:h-48  text-5xl flex items-center justify-center rounded-full ${getColor(selectedColor)}`}>
                {
                  displayName ? displayName.split('').shift() : userInfo.email.split('').shift()
                }
              </div>)}
            </Avatar>

            {
              hovered && (
                <div className='absolute inset-0 flex items-center justify-center bg-slate-700/50 rounded-full ring-fuchsia-50 h-32 w-32 md:w-48 md:h-48'>
                  {
                    image ? (
                      <FaTrash className='text-white text-3xl cursor-pointer' />
                    ) : (
                      <FaPlus className='text-white text-3xl cursor-pointer' />
                    )
                  }
                </div>
              )
            }
            {/* <input type="text" /> */}
          </div>
          <div className='flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center '>
            <div className='w-full'>
              <Input
                placeholder='email'
                type='email'
                disabled
                value={userInfo.email}
                className='p-6 bg-[#2c2e3b] border-none rounded-lg'
              />
            </div>

            <div className='w-full'>
              <Input
                placeholder='Name'
                type='text'
                onChange={(e) => { setDisplayName(e.target.value) }}
                value={displayName}
                className='p-6 bg-[#2c2e3b] border-none rounded-lg'
              />
            </div>


            <div className='w-full flex gap-5 '>
              {
                colorCombinations.map((color, index) => <div className={`${color} h-8 w-8  rounded-full cursor-pointer transition-all duration-300 m-2 sm:m-0 ${selectedColor === index ? 'outline outline-white outline-4' : ''}`} key={index} onClick={() => setSelectedColor(index)}></div>)
              }
            </div>
          </div>
        </div>
        <div className='w-full text-white'>
          <Button className='w-full h-16  bg-purple-700 hover:bg-purple-400 transition-all duration-300 rounded-2xl' onClick={saveChanges}>
            save changes
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Profile