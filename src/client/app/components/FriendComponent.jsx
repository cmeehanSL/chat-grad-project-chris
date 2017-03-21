import React from "react";
import {connect} from "react-redux";


export default class HomeComponent extends React.Component {

    // activeChat() {
    //
    // }

    render() {
        var friend = this.props.friend;

        return (
            <div class="well">
                <span class="friendTab"><img class="avatarImg" src={friend.avatarUrl} /><h5>{friend.id}</h5></span>
            </div>
        );
    }
}
