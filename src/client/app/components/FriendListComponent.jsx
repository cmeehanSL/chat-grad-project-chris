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
        var openConversation = this.props.openConversation;
        console.log("friends is " + friends);
        console.log("friends array is " + friends);
        return (
            <ul id="friendList">
                {friendsArray.map(function(friend, key) {
                    return (
                        <li key={key}>
                            <FriendComponent openConversation={openConversation} friend={friend} key={key}/>
                        </li>
                    )
                })}
            </ul>
        );
    }
}
