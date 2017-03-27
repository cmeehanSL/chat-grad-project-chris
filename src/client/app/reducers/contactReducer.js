export default function reducer(
    state = {
        // sendingMessage: false,
        activeUserId: null,
        userChats: [],
        friendList: [],
        associativeFriendList: {}
        // currentConversation: {} // will be chatId and participant/s
    },
    action) {
    switch(action.type) {
        case "LOGIN_SUCCESSFUL": {
            return {
                ...state,
                activeUserId: action.payload._id
            }
        }
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
        case "CREATED_NEW_CONVERSATION": {
            // break;
            var chatId = action.payload._id;
            var participants = action.payload.participants;
            var userId = state.activeUserId;
            if(participants.length == 2) {
                var friendId = (participants[0] !== userId) ? participants[0] : participants[1];
                var associativeFriendList = JSON.parse(JSON.stringify(state.associativeFriendList));
                console.log("copied associativeFriendList and adding chatId " + chatId + " to friend: " + friendId);
                var friend = associativeFriendList[friendId];
                friend.chatId = chatId;
                return{
                    ...state,
                    associativeFriendList: associativeFriendList
                }
            }
        }
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
            var userId = state.activeUserId;
            var userChats = action.payload.chats;
            var associativeFriendList = JSON.parse(JSON.stringify(state.associativeFriendList));
                        // populate the assoicative friend list chat IDs
            userChats.forEach(function(chat) {
                if(chat.participants.length == 2) {
                    var friendId = (chat.participants[0] !== userId) ? chat.participants[0] : chat.participants[1];

                    associativeFriendList[friendId].chatId = chat.chatId;
                }
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

    }
    return state;
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
}
