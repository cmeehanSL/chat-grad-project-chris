import React from "react";
import {connect} from "react-redux";


export default class FriendComponent extends React.Component {

    constructor(props) {
        super(props);
        this.handleMakeActiveChat = this.handleMakeActiveChat.bind(this);
    }

    handleMakeActiveChat() {
        var friend = this.props.friend;
        var actions = this.props.actions;
        var openConversation = actions.openConversation;
        var fetchConversation = actions.fetchConversation;
        openConversation([friend], friend.chatId);

        if (friend.chatId !== null) {
            fetchConversation(friend.chatId);
        }
    }

    render() {
        var friend = this.props.friend;

        return (
            <div onClick={this.handleMakeActiveChat} className="well">
                <span className="friendTab"><img className="avatarImg"
                    src={friend.avatarUrl} /><h5>{friend.id}</h5>
                </span>
            </div>
        );
    }
}
