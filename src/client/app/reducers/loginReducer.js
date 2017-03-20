export default function reducer(
    state = {
        loggedIn: false,
        attemptingLogin: false,
        loginUri: '#'
    },
    action
) {
    switch(action.type) {
        case "LOGIN_ATTEMPT": {
            return {
                ...state,
                attemptingLogin: true
            }
        }
        case "LOGIN_SUCCESSFUL": {

            return {
                ...state,
                loggedIn: true,
                attemptingLogin: false
            }
        }
        case "LOGIN_FAILED": {
            return {
                ...state,
                attemptingLogin: false
            }
        }
        case "RECEIVED_LOGIN_URI": {

            return {
                ...state,
                loginUri: action.payload
            }
        }
    }

    return state;
}
//
