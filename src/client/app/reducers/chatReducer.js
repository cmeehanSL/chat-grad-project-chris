export default function reducer(
    state = {
        sendingMessage: false,
        chatLog: [],
        friendList: []
    },
    action) {
    switch(action.type) {
        case "RECEIVED_USERS": {
            var friendList = action.payload.friendList;
            return {
                ...state,
                friendList: friendList
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
