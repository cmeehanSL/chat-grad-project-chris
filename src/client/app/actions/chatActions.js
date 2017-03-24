import axios from "axios";

export function openConversation(participants) {
    return function(dispatch) {
        console.log("participants are " + participants);
        dispatch({type: "OPENING_CONVERSATION", payload: participants});
    }
}

export function fetchConversation(chatId) {
    return function(dispatch) {
        dispatch({type: "FETCHING_CONVERSATION"});
        axios.get("/api/chat/" + chatId).then(function(chatResponse) {
            // dispatch({type: "RECEIVED_CURRENT_CONVERSATION", payload: chatResponse.data});
        })
        .catch()
    }
}


export function createNewConversation(otherParticipants) {
    return function(dispatch) {
        dispatch({type: "CREATING_NEW_CONVERSATION"});
        axios({
            method: "POST",
            url: "/api/chat",
            headers: {
                "Content-type": "application/json"
            },
            data: {
                otherParticipants: otherParticipants
            }
        }).then(function(newChatResponse) {
            dispatch({type: "CREATED_NEW_CONVERSATION", payload: newChatResponse.data});
            dispatch({type: "RECEIVED_CURRENT_CONVERSATION", payload: newChatResponse.data});
            // axios.get("/api/user-chats").then( (userChats) => {
            //     console.log("received userChats object of " + userChats.data);
            //     dispatch({type: "RECEIVED_CHATS", payload: userChats.data});
            // });
        });
    }
}


export function sendMessage(text) {
    return function(dispatch) {
        dispatch({type: "SENDING_NEW_MESSAGE", payload: text});
    }
}
