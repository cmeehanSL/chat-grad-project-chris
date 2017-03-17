export default function reducer(
    state = {
        sendingMessage: false,
        chatLog: []
    },
    action) {
    switch(action.type) {
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
