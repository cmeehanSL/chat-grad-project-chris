import axios from "axios";

export function loginAttempt() {
    return function(dispatch) {
        dispatch({type: "LOGIN_ATTEMPT"});
        axios.get("/api/user")
            .then((response) => {
                dispatch({type: "LOGIN_SUCCESSFUL", payload: response.data});
                axios.get("/api/users").then((usersReponse) => {
                    dispatch({type: "RECEIVED_USERS", payload: usersReponse.data});
                    dispatch({type: "FETCHING_CHAT_LIST"});
                    axios.get("/api/user-chats").then((userChats) => {
                        console.log("received userChats object of " + userChats.data);
                        dispatch({type: "RECEIVED_INITIAL_CHATS", payload: userChats.data});
                        dispatch({type: "RECEIVED_UPDATED_CHATS", payload: userChats.data});
                    });
                });
            })
            .catch((err) => {
                dispatch({type: "LOGIN_FAILED", payload: err});
                axios.get("/api/oauth/uri").then((response) => {
                    dispatch({type: "RECEIVED_LOGIN_URI", payload: response.data.uri});
                });
            })
    }
}
