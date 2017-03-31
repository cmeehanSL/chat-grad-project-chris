import axios from "axios";

export function openConversation(participants, chatId) {
    return function(dispatch) {
        console.log("participants are " + participants);
        var openChat = {
            participants: participants,
            chatId: chatId
        };
        dispatch({type: "OPENING_CONVERSATION", payload: openChat});
    }
}

export function fetchConversation(chatId) {
    return function(dispatch) {
        dispatch({type: "FETCHING_CONVERSATION"});
        axios.get("/api/chat/" + chatId).then(function(chatResponse) {
            dispatch({type: "RECEIVED_CURRENT_CONVERSATION", payload: chatResponse.data});
        })
        .catch()
    }
}

export function loadParticipantInfo(otherParticipantIds, associativeFriendList) {
    return function(dispatch) {
        var payload = {
            otherParticipantIds: otherParticipantIds,
            associativeFriendList: associativeFriendList
        };

        dispatch({type: "LOADING_PARTICIPANT_INFO", payload: payload});
    }
}

export function changeListingContacts(listContacts) {
    return function(dispatch) {
        dispatch({type: "CHANGING_LIST_VIEW", payload: listContacts});
    }
}

export function createNewConversation(otherParticipants, text) {
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
            dispatch(sendMessage(newChatResponse.data._id, text));
        })
        // Will have to catch the code in case that chat somehow already existed in which case don't
        // make a new chat between the same two participants and don't make current convo equal it
        .catch();
    }
}

export function closeConversation() {
    return function(dispatch) {
        dispatch({type: "CLOSE_CURRENT_CONVERSATION"});
    }
}


export function sendMessage(chatId, text) {
    return function(dispatch) {
        dispatch({type: "SENDING_NEW_MESSAGE", payload: text});
        var messageTimestamp = new Date();
        axios.post("/api/chat/" + chatId, {
            type: "sent",
            content: text,
            timestamp: messageTimestamp
        })
        .then(function(newMessageResponse) {
            dispatch({type: "SENT_MESSAGE", payload: newMessageResponse.data});
            axios.get("/api/user-chats").then((userChats) => {
                console.log("received userChats object of " + userChats.data);
                dispatch({type: "RECEIVED_UPDATED_CHATS", payload: userChats.data});
            });
        })
        .catch(function() {
            dispatch({type: "SENDING_MESSAGE_FAILED"});
        })

    }
}
