export default function reducer(
    state = {},
    action
) {
    switch(action.type) {
        case "START_CHAT": {
            return {
                ...state,
                currentChat: action.payload
            }
        }
    }

    return state;
}
