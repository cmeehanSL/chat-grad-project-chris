import React from "react";
import {connect} from "react-redux";


export default class HomeComponent extends React.Component {

    constructor(props) {
        super(props);
        this.makeActiveChat = this.makeActiveChat.bind(this);
    }

    makeActiveChat() {
        var friend = this.props.friend;
        var actions = this.props.actions;
        var openConversation = actions.openConversation;
        var fetchConversation = actions.fetchConversation;
        openConversation([friend]);

        if (friend.chatId != null) {
            fetchConversation(friend.chatId);
        }
    }

    render() {
        var friend = this.props.friend;
        var openConversation = this.props.openConversation;

        return (
            <div onClick={this.makeActiveChat} class="well">
                <span class="friendTab"><img class="avatarImg" src={friend.avatarUrl} /><h5>{friend.id}</h5></span>
            </div>
        );
    }
}
