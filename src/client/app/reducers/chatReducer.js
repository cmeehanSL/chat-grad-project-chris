export default function reducer(
    state = {
        sendingMessage: false,
        conversations: [],
        currentConversation: {
            chatId: null,
            messages: [],
            participants: null
        }
    },
    action) {
    switch (action.type) {
        case "OPENING_CONVERSATION": {
            var chatId = action.payload.chatId;
            var participants = action.payload.participants;
            return {
                ...state,
                currentConversation: {
                    ...state.currentConversation,
                    chatId: chatId,
                    participants: participants,
                    messages: []
                }
            }
        }
        case "RECEIVED_CHATS": {
            // var userId = state.activeUserId;
            var userChats = action.payload.chats;
            // var associativeFriendList = JSON.parse(JSON.stringify(state.associativeFriendList));
            // populate the assoicative friend list chat IDs
            var conversations = [];
            userChats.forEach(function(chat) {
                conversations.push()
            });
            // TODO ALSO add the actual contact details (taken from the associative
            // array) and put them into the chat List array (for when adding the list
            // of chat components)
            return {
                ...state,
                userChats: userChats,
                associativeFriendList: associativeFriendList
            }
        }
        case "LOADING_PARTICIPANT_INFO": {
            var otherParticipantIds = action.payload.otherParticipantIds;
            var associativeFriendList = action.payload.associativeFriendList;
            var otherParticipants = [];
            otherParticipantIds.forEach(function(participantId) {
                var participant = associativeFriendList[participantId];
                otherParticipants.push(participant);
            });
            return {
                ...state,
                currentConversation: {
                    ...state.currentConversation,
                    participants: otherParticipants
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
