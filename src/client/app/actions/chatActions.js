import axios from "axios";
// import {Router} from "react-router";

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
            console.log("received the conversation that has id of " + chatResponse.data._id);
            dispatch({type: "RECEIVED_CURRENT_CONVERSATION", payload: chatResponse.data});
            dispatch(resetUnseenCount(chatResponse.data._id));
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
            if (newChatResponse.status === 202) {
                window.location.reload();
                return;
            }
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

export function resetUnseenCount(chatId) {
    return function(dispatch) {
        dispatch({type: "RESETTING_UNSEEN_COUNT"});
        console.log("chat id to reset is " + chatId);
        axios.put("/api/chat/reset/" + chatId).then(function(res) {
            console.log("res is " + res.status);
            if (res.status >= 200 && res.status < 300) {
                dispatch({type: "UNSEEN_COUNT_RESET"});
                dispatch(getUserChats());
            }
        });
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
            dispatch(getUserChats());
        })
        .catch(function() {
            dispatch({type: "SENDING_MESSAGE_FAILED"});
        })
    }
}

export function getUserChats() {
    return function(dispatch) {
        axios.get("/api/user-chats").then((userChats) => {
            console.log("received userChats object of " + userChats.data);
            dispatch({type: "RECEIVED_UPDATED_CHATS", payload: userChats.data});
        });
    }
}

export function initialiseSocket() {
    return function(dispatch) {
        dispatch({type: "INITIALIZING_SOCKET"});
        var rawSocket = new WebSocket(`ws://${location.host}`);
        rawSocket.onopen = () => {
            console.log("web socket connection established");
            rawSocket.send("hello there friend");
        }
        rawSocket.onmessage = (message) => {
            console.log("HIIIIIIIIIII");
            console.log("recieved message on the front end here of " + message.data);
            dispatch(handleSocketMessage(message));
        }
        rawSocket.onclose = () => {
            rawSocket.close();
        }
        window.beforeunload = function() {
            rawSocket.onclose = function() {};
            rawSocket.close();
        }
        dispatch({type: "SOCKET_INITIALIZED", payload: rawSocket});
    }
}



export function handleSocketMessage(message) {
    return function(dispatch) {
        console.log("")
        var data = JSON.parse(message.data);
        switch (data.type) {
            case "LOGGED_IN": {
                break;
            }
            case "RECEIVED_MESSAGE": {
                dispatch(getUserChats());
                dispatch({type: "RECEIVED_MESSAGE", payload: data.content});
                break;
            }
        }
    }
}
