// use to modify info about the user etc
// such as change the name ???

export default function reducer(
    state = {
        activeUser: null
    },
    action
) {
    switch (action.type) {
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
