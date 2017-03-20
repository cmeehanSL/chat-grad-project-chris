export default function reducer(
    state = {},
    action
) {
    switch(action.type) {
        case "LOGIN_SUCCESSFUL": {
            return {
                ...state,
                activeUser: action.payload
            }
        }
        case "START_CHAT": {
            return {
                ...state,
                currentChat: action.payload
            }
        }
    }

    return state;
}
