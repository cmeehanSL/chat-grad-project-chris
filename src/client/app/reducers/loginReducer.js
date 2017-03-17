export default function reducer(
    state = {
        loggedIn: false,
        attemptingLogin: false,
        loginUri: '#hi'
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

            return state;
        }
        case "LOGIN_FAILED": {

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
