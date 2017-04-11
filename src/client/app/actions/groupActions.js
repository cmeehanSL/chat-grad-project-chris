
export function startGroupCreation() {
    return function(dispatch) {
        dispatch({type: "STARTING_NEW_GROUP"});
    }
}

export function cancelGroupCreation() {
    return function(dispatch) {
        dispatch({type: "STOP_NEW_GROUP"});
    }
}

export function createGroup() {
    return function(dispatch) {
        dispatch({type: "CREATE_GROUP"});
    }
}
