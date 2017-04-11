import React from "react";
import {connect} from "react-redux";
import FriendComponent from "./FriendComponent.jsx";
import NewGroupComponent from "./NewGroupComponent.jsx";

export default class FriendListComponent extends React.Component {




    render() {
        var friends = this.props.friendList;
        var friendsArray = Object.keys(friends).map(function(val) {return friends[val]});
        var actions = this.props.actions;
        var groupActions = this.props.groupActions;
        var newGroupMembers = this.props.newGroupMembers;
        var creatingGroup = this.props.creatingGroup;
        return (
            <div>
                <NewGroupComponent actions={actions} groupActions={groupActions}
                    creatingGroup={creatingGroup} newGroupMembers={newGroupMembers} />
                <ul id="friendList">
                    {friendsArray.map(function(friend, key) {
                        return (
                            <li key={key}>
                                <FriendComponent creatingGroup={creatingGroup} actions={actions}
                                     groupActions={groupActions} friend={friend}
                                     key={key} newGroupMembers={newGroupMembers} />
                            </li>
                        )
                    })}
                </ul>
            </div>
        );
    }
}
