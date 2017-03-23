import React from "react";
import {connect} from "react-redux";


export default class HomeComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        var friends = this.props.friends;
        var friend = friends[0];
        console.log("current friends are " + friends);

        return (
            <div onClick={this.makeActiveChat} class="well chatHeader">
                <span class="friendHeaderTab"><img class="avatarImg" src={friend.avatarUrl} /><h3>{friend.id}</h3></span>
            </div>
        );
    }
}
