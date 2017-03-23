export default function reducer(
    state = {
        sendingMessage: false,
        activeChats: [],
        // friendList: [],
        currentConversation: {
            chatId: null
        } // will be chatId and participant/s
    },
    action) {
    switch(action.type) {
        case "OPENING_CONVERSATION": {
            console.log("opening conversation with friend " + action.payload);
            return {
                ...state,
                currentConversation: {
                    ...state.currentConversation,
                    participants: action.payload
                }
            }
        }
        case "RECEIVED_CURRENT_CONVERSATION": {
            return {
                ...state,
                currentConversation: {
                    ...state.currentConversation,
                    chatId: action.payload.chatId,
                    messages: action.payload.messages
                }
            }
        }
        case "CREATED_NEW_CONVERSATION": {
            return {
                ...state,
                currentConversation: {
                    ...state.currentConversation,
                    chatId: action.payload
                }
            }
        }
        case "SEND_MESSAGE": {
            var newMessage = {
                text: action.payload,
                type: "sent"
            }
            var newChatLog = state.chatLog.concat(newMessage);
            return {
                ...state,
                chatLog: newChatLog
            }
        }

    }
    return state;
}
