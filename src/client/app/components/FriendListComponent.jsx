import React from "react";
import {connect} from "react-redux";
import {toArray} from "underscore";
import FriendComponent from "./FriendComponent.jsx";


export default class HomeComponent extends React.Component {


    render() {
        var friends = this.props.friendList;
        console.log("associativeFriendList is " + friends);
        var friendsArray = Object.keys(friends).map(function(val) {return friends[val]});
        // var friendsArray = toArray()
        var actions = this.props.actions;
        console.log("friends is " + friends);
        console.log("friends array is " + friends);
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
