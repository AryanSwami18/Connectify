export const createChatSlice = (set, get) => ({
    selectedChatType: undefined,
    selectedChatData: undefined,
    selectedChatMessages: [],
    messageContacts:[],
    unreadMessages: {},
    groups:[],
    isInVideoCall:false,
    activeVideoCallParticipant: undefined,
    incomingVideoCall: undefined,
    incomingVideoCallOffer: undefined,
    videoCallStatus: 'idle',
    setVideoCallStatus: (status) => set({ isInVideoCall: status }),
    setVideoCallState: (callState) => set(callState),
    startOutgoingVideoCall: (participant) =>
        set({
            isInVideoCall: true,
            activeVideoCallParticipant: participant,
            incomingVideoCall: undefined,
            incomingVideoCallOffer: undefined,
            videoCallStatus: 'calling',
        }),
    setIncomingVideoCall: ({ participant, offer }) =>
        set({
            incomingVideoCall: participant,
            incomingVideoCallOffer: offer,
            videoCallStatus: 'incoming',
        }),
    acceptIncomingVideoCall: () => {
        const { incomingVideoCall } = get();
        set({
            isInVideoCall: true,
            activeVideoCallParticipant: incomingVideoCall,
            videoCallStatus: 'connecting',
        });
    },
    declineIncomingVideoCall: () =>
        set({
            incomingVideoCall: undefined,
            incomingVideoCallOffer: undefined,
            videoCallStatus: 'idle',
        }),
    resetVideoCall: () =>
        set({
            isInVideoCall: false,
            activeVideoCallParticipant: undefined,
            incomingVideoCall: undefined,
            incomingVideoCallOffer: undefined,
            videoCallStatus: 'idle',
        }),
    setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
    setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
    setSelectedChatMessages: (selectedChatMessages) => set({ selectedChatMessages }),
    closeChat: () => set({ selectedChatData: undefined, selectedChatType: undefined, selectedChatMessages: [] }),
    addMessage: (message) => {        
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
    upsertMessageContact: (contact) => {
        if (!contact?._id) {
            return;
        }

        const messageContacts = get().messageContacts;
        const existingContact = messageContacts.find(
            (currentContact) => currentContact._id === contact._id
        );
        const filteredContacts = messageContacts.filter(
            (existingContact) => existingContact._id !== contact._id
        );

        set({
            messageContacts: [
                {
                    ...existingContact,
                    ...contact,
                    unreadCount: contact.unreadCount ?? existingContact?.unreadCount ?? 0,
                },
                ...filteredContacts
            ]
        });
    },
    incrementUnreadCount: (contactId) => {
        if (!contactId) {
            return;
        }

        const unreadMessages = get().unreadMessages;
        const messageContacts = get().messageContacts;

        set({
            unreadMessages: {
                ...unreadMessages,
                [contactId]: (unreadMessages[contactId] || 0) + 1,
            },
            messageContacts: messageContacts.map((contact) =>
                contact._id === contactId
                    ? {
                        ...contact,
                        unreadCount: (contact.unreadCount || 0) + 1,
                    }
                    : contact
            )
        });
    },
    clearUnreadCount: (contactId) => {
        if (!contactId) {
            return;
        }

        const unreadMessages = get().unreadMessages;
        const messageContacts = get().messageContacts;

        set({
            unreadMessages: {
                ...unreadMessages,
                [contactId]: 0,
            },
            messageContacts: messageContacts.map((contact) =>
                contact._id === contactId
                    ? {
                        ...contact,
                        unreadCount: 0,
                    }
                    : contact
            )
        });
    },
    setGroups:(groups)=>{set({groups})},
    addGroups:(newGroup)=>{
        const groups = get().groups
        set({
            groups: [...groups, newGroup]
        })
    }
})
