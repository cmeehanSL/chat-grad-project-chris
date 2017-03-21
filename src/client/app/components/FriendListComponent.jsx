import React from "react";
import {connect} from "react-redux";

import FriendComponent from "./FriendComponent.jsx";


export default class HomeComponent extends React.Component {


    render() {
        var friends = this.props.friendList;
        console.log("friends is " + friends);
        return (
            <ul id="friendList">
                            {friends.map(function(friend, key) {
                                return (
                                    <li key={key}>
                                        <FriendComponent friend={friend} key={key}/>
                                    </li>
                                )
                            })}
            </ul>
        );
    }
}
