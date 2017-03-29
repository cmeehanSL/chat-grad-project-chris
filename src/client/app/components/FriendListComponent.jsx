import React from "react";
import {connect} from "react-redux";
import FriendComponent from "./FriendComponent.jsx";


export default class FriendListComponent extends React.Component {


    render() {
        var friends = this.props.friendList;
        var friendsArray = Object.keys(friends).map(function(val) {return friends[val]});
        var actions = this.props.actions;
        return (
            <ul id="friendList">
                {friendsArray.map(function(friend, key) {
                    return (
                        <li key={key}>
                            <FriendComponent actions={actions} friend={friend} key={key}/>
                        </li>
                    )
                })}
            </ul>
        );
    }
}
