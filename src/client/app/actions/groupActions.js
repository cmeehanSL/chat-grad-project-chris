
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

export function createGroup(newGroupMembers) {
    return function(dispatch) {
        dispatch({type:"CREATING_GROUP"});
        // dispatch({type: "CREATE_GROUP", payload: newGroupMembers});
    }
}

export function selectNewMember(memberId) {
    return function(dispatch) {
        dispatch({type: "ADDING_NEW_MEMBER", payload: memberId});
    }
}

export function removeNewMember(memberId) {
    return function(dispatch) {
        dispatch({type: "REMOVING_NEW_MEMBER", payload: memberId});
    }
}
