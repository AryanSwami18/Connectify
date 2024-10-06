import React from 'react';
import Logo from '../../../../assets/Logo-Without-Slogan.png';
import ProfileInfoComponent from './components/profileInfo/';
import NewMessage from './components/newMessage';








function ContactContainer() {
  return (
    <div className='relative md:w-[30vw] lg:w-[25vw] xl:w-[20vw] bg-slate-800 border-r-2 border-[#ffffff] w-full h-full  '>
      <div className="pt-3 m-5 flex items-center"> {/* Flexbox applied here */}
        <img src={Logo} alt="Company Logo" className='h-10 w-10 mr-3' /> {/* Added margin to the right */}
        <h1 className='text-white text-3xl font-bold poppins-medium pt-2'>Connectify</h1>
      </div>

      <div className="my-5">
        <div className='flex items-center justify-between pr-3'>
            <Title title={'Direct Message'}/>
            <NewMessage/>
        </div>
      </div>

      <div className="my-5">
        <div className='flex items-center justify-between pr-3'>
            <Title title={'Groups'}/>
        </div>
      </div>
      <ProfileInfoComponent className='w-full'/>
    </div>
  );
}

export default ContactContainer;



function Title({title}){
  return(
    <h6 className='uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm'>
      {title}
    </h6>
  )
}