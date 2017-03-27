export default function reducer(
    state = {
        sendingMessage: false,
        // friendList: [],
        currentConversation: {
            chatId: null,
            messages: [],
            participants: null
        } // will be chatId and participant/s
    },
    action) {
    switch(action.type) {
        case "OPENING_CONVERSATION": {
            var chatId = action.payload.chatId;
            var participants = action.payload.participants;
            console.log("opening conversation with friend/s " + participants);
            console.log("and chatId: " + chatId);
            return {
                ...state,
                currentConversation: {
                    ...state.currentConversation,
                    chatId: chatId,
                    participants: participants
                }
            }
        }
        case "CLOSE_CURRENT_CONVERSATION": {
            return {
                ...state,
                currentConversation: {
                    chatId: null,
                    messages: [],
                    participants: null
                }
            }
        }
        case "RECEIVED_CURRENT_CONVERSATION": {
            // To make the current conversation info match the correct details
            var returnedChat = action.payload;
            return {
                ...state,
                currentConversation: {
                    ...state.currentConversation,
                    chatId: returnedChat._id,
                    messages: returnedChat.messages
                }
            }
        }
        case "CREATED_NEW_CONVERSATION": {
            break;

            // return {
            //     ...state,
            //     currentConversation: {
            //         ...state.currentConversation,
            //         chatId: action.payload
            //     }
            // }
        }
        case "SENT_MESSAGE": {
            var newMessage = action.payload;
            var oldMessageList = state.currentConversation.messages;
            var newMessageList = oldMessageList.concat(newMessage);
            return {
                ...state,
                currentConversation: {
                    ...state.currentConversation,
                    messages: newMessageList
                }
            }
        }

    }
    return state;
}
