import React, { useState } from 'react';
import SmileEmoji from '@/assets/happy-smile-emoji-free-png.png';
import BackgroundImage from '@/assets/image.png'
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { TabsList } from '@radix-ui/react-tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function Auth() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('')


  const handleLogin = async () => {

  }

  const handleSignUp = async () => {

  }
  return (
    <div className='h-[100vh] w-[100vw] flex items-center justify-center'>
      <div className='h-[80vh] bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2'>
        <div className='flex flex-col gap-10 items-center justify-center'>
          <div className='flex items-center justify-center flex-col'>
            <div className='flex items-center justify-center'>
              <h1 className='text-5xl font-bold md:text-6xl'>Welcome</h1>
              <img src={SmileEmoji} alt="Smile Happy Emoji" className='h-[95px]' />
            </div>
            <p className='font-medium text-center px-14'>Fill in the details to get started</p>
          </div>

          <div className='flex items-center justify-center w-full'>
            <Tabs className='w-4/4'>
              <TabsList className='flex border-b border-gray-300 bg-transparent w-full'>
                <TabsTrigger
                  value="login"
                  className='px-14 py-2 text-lg font-medium text-gray-700 border-b-2 border-transparent transition-all duration-300 data-[state=active]:border-blue-500'
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signUp"
                  className='px-14 py-2 text-lg font-medium text-gray-700 border-b-2 border-transparent transition-all duration-300 data-[state=active]:border-blue-500'
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login" className=' flex flex-col gap-10 mt-5'>
                {/* login here */}
                <Input
                  placeholder='Email'
                  type='email'
                  className='rounded-full p-6'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                  placeholder='Password'
                  type='password'
                  className='rounded-full p-6'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button className='rounded-full p-6  bg-black  text-white transition duration-300 ease-in-out  hover:bg-gray-300  hover:text-gray-800' onClick={handleLogin}>Login</Button>
              </TabsContent>
              <TabsContent value="signUp" className='flex flex-col gap-10 '>
                {/* sign up here */}
                <Input
                  placeholder='Email'
                  type='email'
                  className='rounded-full p-6'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                  placeholder='Password'
                  type='password'
                  className='rounded-full p-6'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <Input
                  placeholder=' Confirm Password'
                  type='password'
                  className='rounded-full p-6'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <Button className=' rounded-full p-6  bg-black  text-white transition duration-300 ease-in-out  hover:bg-gray-300  hover:text-gray-800' onClick={handleSignUp}>Login</Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className='hidden xl:flex justify-center items-center'>
          <img src={BackgroundImage} alt="Login Image"  className='h-[320px]'/>
        </div>
      </div>
    </div>
  );
}

export default Auth;
