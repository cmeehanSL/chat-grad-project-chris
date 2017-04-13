export default function reducer(
    state = {
        sendingMessage: false,
        activeUserId: null,
        associativeConversations: {},
        currentConversation: {
            chatId: null,
            messages: [],
            participants: [],
            toResetUnseenCount: false,
            groupName: null
        }
    },
    action) {
    switch (action.type) {
        case "LOGIN_SUCCESSFUL": {
            return {
                ...state,
                activeUserId: action.payload._id
            }
        }
        case "OPENING_CONVERSATION": {
            var chatId = action.payload.chatId;
            var participants = action.payload.participants;
            return {
                ...state,
                currentConversation: {
                    ...state.currentConversation,
                    chatId: chatId,
                    participants: participants,
                    messages: [],
                    groupName: null
                }
            }
        }
        case "CHANGED_GROUP_NAME": {
            var chatId = action.payload.chatId;
            var newGroupName = action.payload.groupName;
            var associativeConversations = JSON.parse(JSON.stringify(state.associativeConversations));
            associativeConversations[chatId] = {
                ...associativeConversations[chatId],
                groupName: newGroupName
            };
            return {
                ...state,
                associativeConversations: associativeConversations,
                currentConversation: {
                    ...state.currentConversation,
                    groupName: newGroupName
                }
            }
        }
        // THIS SHOULD BE CHANGED TO RECEIVED INITIAL CHATS THEN ONLY update
        // the associativeConversations as necessary when new one arrives etc
        case "RECEIVED_UPDATED_CHATS": {
            // var userId = state.activeUserId;
            var conversations = action.payload.chats;
            var associativeConversations = {};

            // BUILD ASSOCIATIVE array
            conversations.forEach(function(conversation) {
                associativeConversations[conversation.chatId] = {
                    ...conversation,
                }
            });


            // TODO ALSO add the actual contact details (taken from the associative
            // array) and put them into the chat List array (for when adding the list
            // of chat components)
            return {
                ...state,
                associativeConversations: associativeConversations
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
                    participants: otherParticipants,
                }
            }
        }
        case "CLOSE_CURRENT_CONVERSATION": {
            return {
                ...state,
                currentConversation: {
                    chatId: null,
                    messages: [],
                    participants: []
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
                    messages: returnedChat.messages,
                    groupName: returnedChat.groupName
                }
            }
        }
        case "CREATED_NEW_CONVERSATION": {
            var chatId = action.payload._id;
            var participants = action.payload.participants;
            var associativeConversations = JSON.parse(JSON.stringify(state.associativeConversations));
            associativeConversations[action.payload._id] = {
                chatId: chatId,
                participants: participants,
                mostRecentMessage: {
                    sender: state.activeUserId,
                    content: "Group Created",
                    timestamp: new Date(),
                    chatId: chatId
                },
                unseenCount: 0
            };
            // Add the new chat to the user's conversations so that chat components can be re-rendered
            // NOTE This will already be added to the User's chats on the server
            return {
                ...state,
                associativeConversations: associativeConversations
            }
        }
        case "RECEIVED_NEW_CONVERSATION": {
            var chatId = action.payload._id;
            var participants = action.payload.participants;
            var userId = state.activeUserId;
            var currentConversation = state.currentConversation;
            var newCurrentChatId = currentConversation.chatId;

            var associativeConversations = JSON.parse(JSON.stringify(state.associativeConversations));
            associativeConversations[chatId] = {
                chatId: chatId,
                participants: participants,
                unseenCount: 0,
                mostRecentMessage: {
                    content: null,
                    timestamp: null
                }
            };

            if (participants.length === 2) {
                console.log("participants length is 2");
                if(currentConversation.chatId == null && currentConversation.participants.length == 1) {
                    console.log("the current conversation should be this one so refreshing");
                    var friendId = (participants[0] !== userId) ? participants[0] : participants[1];
                    if (friendId === currentConversation.participants[0].id) {
                        console.log("for real here");
                        newCurrentChatId = chatId;
                    }
                }
            }
            return {
                ...state,
                associativeConversations: associativeConversations,
                currentConversation: {
                    ...state.currentConversation,
                    chatId: newCurrentChatId
                }
            }
        }
        case "UNSEEN_COUNT_RESET_CLIENT": {
            var chatId = action.payload;
            var associativeConversations = JSON.parse(JSON.stringify(state.associativeConversations));
            associativeConversations[chatId].unseenCount = 0;

            return {
                ...state,
                associativeConversations: associativeConversations
            }
        }
        case "UNSEEN_COUNT_RESET_SERVER": {
            return {
                ...state,
                currentConversation: {
                    ...state.currentConversation,
                    toResetUnseenCount: false
                }
            }
        }
        case "SENT_MESSAGE": {
            var newMessage = action.payload;
            var oldMessageList = state.currentConversation.messages;
            var newMessageList = oldMessageList.concat(newMessage);

            var associativeConversations = JSON.parse(JSON.stringify(state.associativeConversations));
            associativeConversations[newMessage.chatId].mostRecentMessage = newMessage;

            return {
                ...state,
                associativeConversations: associativeConversations,
                currentConversation: {
                    ...state.currentConversation,
                    messages: newMessageList
                }
            }
        }
        case "RECEIVED_MESSAGE": {
            var newMessage = action.payload;
            var oldMessageList = state.currentConversation.messages.slice();
            var newMessageList;
            var associativeConversations = JSON.parse(JSON.stringify(state.associativeConversations));
            associativeConversations[newMessage.chatId].mostRecentMessage = newMessage;

            if (newMessage.chatId == state.currentConversation.chatId) {
                newMessageList = oldMessageList.concat(newMessage);
                return {
                    ...state,
                    associativeConversations: associativeConversations,
                    currentConversation: {
                        ...state.currentConversation,
                        messages: newMessageList,
                        toResetUnseenCount: true
                    }
                }
            }
            else {
                console.log("incrementing unseen count");
                newMessageList = oldMessageList;
                associativeConversations[newMessage.chatId].unseenCount += 1;
                return {
                    ...state,
                    associativeConversations: associativeConversations,
                    currentConversation: {
                        ...state.currentConversation,
                        toResetUnseenCount: false
                    }

                }
            }
        }
        case "FRIEND_CREATED_CONVERSATION": {
            // set the current conversation to this new conversation if
            // the new conversation participants is exactly the same
            // as the current conversation participants ( just one other participant )
            break;
        }
    }
    return state;
}
