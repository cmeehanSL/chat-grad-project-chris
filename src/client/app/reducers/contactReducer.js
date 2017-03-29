export default function reducer(
    state = {
        // sendingMessage: false,
        activeUserId: null,
        conversations: [],
        friendList: [],
        associativeFriendList: {},
        listingContacts: true
        // currentConversation: {} // will be chatId and participant/s
    },
    action) {
    switch (action.type) {
        case "LOGIN_SUCCESSFUL": {
            return {
                ...state,
                activeUserId: action.payload._id
            }
        }
        case "CHANGING_LIST_VIEW": {
            var newListingContacts = action.payload;
            return {
                ...state,
                listingContacts: newListingContacts
            }
        }
        case "CREATED_NEW_CONVERSATION": {
            var chatId = action.payload._id;
            var participants = action.payload.participants;
            var userId = state.activeUserId;
            // Add the new chat to the user's conversations so that chat components can be re-rendered
            // NOTE This will already be added to the User's chats on the server
            var conversations = state.conversations.concat({
                chatId: chatId,
                participants: participants
            });
            if (participants.length === 2) {
                var friendId = (participants[0] !== userId) ? participants[0] : participants[1];
                var associativeFriendList = JSON.parse(JSON.stringify(state.associativeFriendList));
                console.log("copied associativeFriendList and adding chatId " + chatId + " to friend: " + friendId);
                var friend = associativeFriendList[friendId];
                friend.chatId = chatId;
                return {
                    ...state,
                    associativeFriendList: associativeFriendList,
                    conversations: conversations
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
            var userId = state.activeUserId;
            var conversations = action.payload.chats;
            var associativeFriendList = JSON.parse(JSON.stringify(state.associativeFriendList));
            // populate the assoicative friend list chat IDs
            conversations.forEach(function(chat) {
                if (chat.participants.length === 2) {
                    var friendId = (chat.participants[0] !== userId) ? chat.participants[0] : chat.participants[1];

                    associativeFriendList[friendId].chatId = chat.chatId;
                }
            });
            // TODO ALSO add the actual contact details (taken from the associative
            // array) and put them into the chat List array (for when adding the list
            // of chat components)
            return {
                ...state,
                conversations: conversations,
                associativeFriendList: associativeFriendList
            }
        }

    }
    return state;
}
