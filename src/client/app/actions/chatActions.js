import axios from "axios";

export function openConversation(participants) {
    return function(dispatch) {
        console.log("participants are " + participants);
        dispatch({type: "OPENING_CONVERSATION", payload: participants});
    }
}

export function fetchMessages(chatId) {
    return function(dispatch) {
        dispatch({type: "FETCHING_CONVERSATION"});
        axios.get("/api/chat" + chatId).then(function(chatResponse) {
            dispatch({type: "RECEIVED_CURRENT_CONVERSATION", payload: chatResponse.messages});
        })
        .catch()
    }
}


export function createNewConversation() {
    return function(dispatch) {
        dispatch({type: "CREATING_NEW_CONVERSATION"});

    }
}


export function sendMessage(text) {
    return function(dispatch) {
        dispatch({type: "SENDING_NEW_MESSAGE", payload: text});
    }
}
