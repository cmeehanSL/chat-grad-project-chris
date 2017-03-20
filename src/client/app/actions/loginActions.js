import axios from "axios";

export function loginAttempt() {
    return function(dispatch){
        dispatch({type: "LOGIN_ATTEMPT"});
        axios.get("/api/user")
            .then((response) => {
                dispatch({type: "LOGIN_SUCCESSFUL", payload: response.data});
                axios.get("/api/users").then((reponse) => {
                    dispatch({type: "RECEIVED_USERS", payload: response.data});
                })
            })
            .catch((err) => {
                dispatch({type: "LOGIN_FAILED", payload: err});
                axios.get("/api/oauth/uri").then((response) => {
                    dispatch({type: "RECEIVED_LOGIN_URI", payload: response.data.uri});
                })
            })
    }
}
