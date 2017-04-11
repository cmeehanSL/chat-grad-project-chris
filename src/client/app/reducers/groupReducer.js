export default function reducer(
    state = {
        creatingGroup: false,
        newGroupMembers: []
    },
    action) {
    switch (action.type) {
        case "STARTING_NEW_GROUP": {
            return {
                ...state,
                creatingGroup: true
            }
        }
        case "STOP_NEW_GROUP": {
            return {
                ...state,
                creatingGroup: false,
                newGroupMembers: []
            }
        }
        case "ADDING_NEW_MEMBER": {
            var newMember = action.payload;
            var newGroupMembers = state.newGroupMembers.concat(newMember);
            return {
                ...state,
                newGroupMembers: newGroupMembers
            }
        }
        case "REMOVING_NEW_MEMBER": {
            var memberToRemove = action.payload;
            var newGroupMembers = [];
            state.newGroupMembers.forEach(function(member) {
                if (member.id != memberToRemove.id) {
                    newGroupMembers.push(member);
                }
            });
            return {
                ...state,
                newGroupMembers: newGroupMembers
            }
        }
    }
    return state;
}
