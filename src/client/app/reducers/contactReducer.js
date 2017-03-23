export default function reducer(
    state = {
        // sendingMessage: false,
        userChats: [],
        friendList: [],
        associativeFriendList: {}
        // currentConversation: {} // will be chatId and participant/s
    },
    action) {
    switch(action.type) {
        // case "OPENING_CONVERSATION": {
        //     console.log("opening conversation with friend id " + action.payload);
        //     return {
        //         ...state,
        //         currentConversation: {
        //             ...state.currentConversation,
        //             participants: action.payload
        //         }
        //     }
        // }
        case "RECEIVED_USERS": {
            var friendList = action.payload;
            var associativeFriendList = {};
            //Create the associative friend list
            friendList.forEach(function(friend) {
                associativeFriendList[friend.id] = {
                    ...friend,
                    chatId: null
                };
            });
            return {
                ...state,
                friendList: friendList,
                associativeFriendList: associativeFriendList
            }
        }
        case "RECEIVED_CHATS": {
            console.log("received userchat object of " + action.payload);
            var userChats = action.payload.chats;
            // populate the assoicative friend list chat IDs
            userChats.forEach(function(chat) {
                if(chat.participants.length == 1) {
                    var friendId = chat.participants[0];
                    associativeFriendList[friendId].chatId = chat.id;
                }
            });
            // TODO ALSO add the actual contact details (taken from the associative
            // array) and put them into the chat List array (for when adding the list
            // of chat components)
            return {
                ...state,
                userChats: userChats
            }
        }
        // case "RECEIVED_CURRENT_CONVERSATION": {
        //     return {
        //         ...state,
        //         currentConversation: {
        //             ...state.currentConversation,
        //             chatId: action.payload.chatId,
        //             messages: action.payload.messages
        //         }
        //     }
        // }
        case "CREATED_NEW_CONVERSATION": {
            return {
                ...state,
                currentConversation: {
                    ...state.currentConversation,
                    chatId: action.payload
                }
            }
        }
    }
    return state;
}
