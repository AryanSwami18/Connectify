import { useAppStore } from '@/store'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack } from 'react-icons/io5'
import { Avatar } from '@/components/ui/avatar'
import { AvatarImage } from '@radix-ui/react-avatar'
import { getColor, colorCombinations } from '@/utils/utils'
import { FaTrash, FaPlus } from 'react-icons/fa'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { apiClient } from '@/lib/apiClient'
import { PROFILE_PICTURE_DELETE_ROUTE, PROFILE_PICTURE_UPLOAD_ROUTE, UPDATE_PROFILE_ROUTE } from '@/utils/constant'

function Profile() {
  const navigate = useNavigate()
  const { userInfo, setUserInfo } = useAppStore()
  const [displayName, setDisplayName] = useState('')
  const [image, setImage] = useState('')
  const [hovered, setHovered] = useState(false)
  const [selectedColor, setSelectedColor] = useState(1)
  const [loading, setLoading] = useState(false) // Loading state
  const profilePictureInputRef = useRef(null);

  useEffect(() => {
    if (userInfo.profileSetup) {
      setDisplayName(userInfo.displayName)
      setSelectedColor(userInfo.color)
      setImage(userInfo.image) // Assuming you want to set the initial image as well
    }
  }, [userInfo])

  const validateProfile = () => {
    if (!displayName) {
      toast.error('Please Enter A Name')
      return false
    }

    if (!/^[A-Za-z ]+$/.test(displayName)) {
      toast.error('Name should not contain numbers or special characters');
      return false;
    }

    return true
  }

  const saveChanges = async () => {
    if (validateProfile()) {
      try {
        const response = await apiClient.post(UPDATE_PROFILE_ROUTE, { displayName, selectedColor }, { withCredentials: true })
        if (response.status === 200 && response.data.user.profileSetup === true) {
          setUserInfo({ ...response.data.user })
          toast.success("Profile Updated")
          navigate('/chat')
        }
      } catch (error) {
        toast.error(error.response.data.message)
      }
    }
  }

  const navigateToChat = () => {
    if (!userInfo.profileSetup) {
      toast.error('Please Setup Your Profile Before you Go Back')
    } else {
      navigate('/chat')
    }
  }

  const handleFileInputClicked = () => {
    profilePictureInputRef.current.click();
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const formData = new FormData()
      formData.append('profileImage', file)

      setLoading(true); // Set loading to true
      try {
        const response = await apiClient.post(PROFILE_PICTURE_UPLOAD_ROUTE, formData, { withCredentials: true })
        if (response.status === 200 && response.data.user.image) {
          setUserInfo(response.data.user)
          setImage(response.data.user.image);
          toast.success('Image Updated Successfully')
        }
      } catch (error) {
        toast.error('Failed to upload image');
      } finally {
        setLoading(false); // Reset loading state
      }
    }
  }

  const handleDeleteImage = async (event) => {
    // Add delete image logic here 
    setLoading(true); // Set loading to true
    try {
      const response = await apiClient.post(PROFILE_PICTURE_DELETE_ROUTE, null, {
        withCredentials: true
      });
      if (response.status === 200 && !response.data.user.image) {
        setUserInfo(response.data.user)
        setImage(''); // Update the image state
        toast.success('Image Deleted  Successfully')
      }
    } catch (error) {
      toast.error('Failed to delete image');
    }
    finally {
      setLoading(false); // Reset loading state
    }
  }

  return (
    <div className='bg-[#1b1c24] h-[100vh] flex items-center justify-center flex-col gap-20'>
      <div className='flex flex-col gap-10 w-[80vw] md:w-max'>
        <div onClick={navigateToChat}>
          <IoArrowBack className='text-4xl lg:text-3xl text-white text-opacity-90 cursor-pointer' />
        </div>

        <div className='grid grid-cols-2'>
          <div className='h-32 w-32 md:w-48 md:h-48 relative flex items-center justify-center'
            onMouseEnter={() => { setHovered(true) }}
            onMouseLeave={() => { setHovered(false) }}
          >
            <Avatar className='h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden'>
              {image ? (
                <AvatarImage src={image} alt='Profile Image' className='object-cover w-full h-full bg-black' />
              ) : (
                <div className={`uppercase h-32 w-32 md:w-48 md:h-48 text-5xl flex items-center justify-center rounded-full ${getColor(selectedColor)}`}>
                  {displayName ? displayName.split('').shift() : userInfo.email.split('').shift()}
                </div>
              )}
            </Avatar>

            {loading && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/70 rounded-full'>
                <span className='text-white'>Loading...</span>
              </div>
            )}

            {hovered && !loading && (
              <div className='absolute inset-0 flex items-center justify-center bg-slate-700/50 rounded-full ring-fuchsia-50 h-32 w-32 md:w-48 md:h-48' onClick={image ? handleDeleteImage : handleFileInputClicked}>
                {image ? (
                  <FaTrash className='text-white text-3xl cursor-pointer' />
                ) : (
                  <FaPlus className='text-white text-3xl cursor-pointer' />
                )}
              </div>
            )}

            <Input type='file' ref={profilePictureInputRef} className='hidden' onChange={handleImageChange} name='profileImage' accept='.png,.jpg,.jpeg,.svg,.webp' />
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

            <div className='w-full flex gap-5'>
              {colorCombinations.map((color, index) => {
                const isDisabled = !!image; 
                return (
                  <div
                    className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300 m-2 sm:m-0 ${selectedColor === index ? 'outline outline-white outline-4' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    key={index}
                    onClick={!isDisabled ? () => setSelectedColor(index) : null} 
                  ></div>
                );
              })}
            </div>
          </div>
        </div>

        <div className='w-full text-white'>
          <Button className='w-full h-16 bg-purple-700 hover:bg-purple-400 transition-all duration-300 rounded-2xl' onClick={saveChanges}>
            save changes
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Profile;
