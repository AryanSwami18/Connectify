export const createChatSlice = (set, get) => ({
    selectedChatType: undefined,
    selectedChatData: undefined,
    selectedChatMessages: [],
    messageContacts:[],
    groups:[],
    setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
    setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
    setSelectedChatMessages: (selectedChatMessages) => set({ selectedChatMessages }),
    closeChat: () => set({ selectedChatData: undefined, selectedChatType: undefined, selectedChatMessages: [] }),
    addMessage: (message) => {
        console.log('i amdansd coming here in the name of love');
        
        const selectedChatMessages = get().selectedChatMessages
        const selectedChatType = get().selectedChatType
        set({
            selectedChatMessages: [
                ...selectedChatMessages, {
                    message,
                    recipient: selectedChatType === 'channel' ? message.recipient : message.recipient._id,
                    sender:selectedChatType === 'channel' ? message.sender : message.sender._id,
                }

            ]
        })
    },
    setMessageContacts: (messageContacts)=>{set({messageContacts})},
    addMessageContacts :(contact)=>{
        const messageContacts = get().messageContacts
        set({
            messageContacts: [...messageContacts, contact]
            })
    },
    setGroups:(groups)=>{set({groups})},
    addGroups:(newGroup)=>{
        const groups = get().groups
        set({
            groups: [...groups, newGroup]
        })
    }
})