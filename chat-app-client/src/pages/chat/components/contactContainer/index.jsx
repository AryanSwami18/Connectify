import React, { useEffect } from 'react';
import Logo from '../../../../assets/Logo-Without-Slogan.png';
import ProfileInfoComponent from './components/profileInfo/';
import NewMessage from './components/newMessage';
import { apiClient } from '@/lib/apiClient';
import { GET_MESSAGE_CONTACTS_ROUTE, GET_USER_GROUPS } from '@/utils/constant';
import { useAppStore } from '@/store';
import ContactList from '@/components/ContactList';
import CreateGroup from './components/createGroup';

function ContactContainer() {
  const {setMessageContacts,messageContacts ,groups,setGroups, selectedChatType} = useAppStore()

  useEffect(()=>{
    const getContacts = async()=>{
      console.log('heheheh');
      
      const response = await apiClient.get(GET_MESSAGE_CONTACTS_ROUTE,{withCredentials:true});
      if(response.data.contacts){
        setMessageContacts(response.data.contacts)
      }
    }

    const getGroups = async()=>{
      console.log('no my  groups');
      const response = await apiClient.get(GET_USER_GROUPS,{withCredentials:true})
      console.log(response);
      if(response.status === 200){
        setGroups(response.data.groups)
      }
    }

    getContacts()
    getGroups()
  },[setGroups,setMessageContacts])


  return (
    <aside className={`${selectedChatType ? 'hidden md:flex' : 'flex'} relative h-full w-full flex-col border-r border-white/10 bg-slate-800 md:w-[320px] lg:w-[360px] xl:w-[380px]`}>
      <div className="flex items-center gap-3 px-5 pb-2 pt-5">
        <img src={Logo} alt="Company Logo" className='h-10 w-10 shrink-0' />
        <h1 className='text-white text-2xl font-bold poppins-medium sm:text-3xl'>Connectify</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-24">
        <div className="my-5">
          <div className='flex items-center justify-between pr-3'>
            <Title title={'Direct Message'}/>
            <NewMessage/>
          </div>
          <div className='max-h-[34vh] overflow-y-auto scrollbar-hidden md:max-h-[38vh]'>
            <ContactList contacts={messageContacts}/>
          </div>
        </div>

        <div className="my-5">
          <div className='flex items-center justify-between pr-3'>
            <Title title={'Groups'}/>
            <CreateGroup/>
          </div>
          <div className='max-h-[34vh] overflow-y-auto scrollbar-hidden md:max-h-[38vh]'>
            <ContactList contacts={groups} isChannel={true}/>
          </div>
        </div>
      </div>
      <ProfileInfoComponent className='w-full'/>
    </aside>
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
